import os
import shutil
import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as DBSession

from app.core.pipeline import run_pipeline
from app.core.database import Base, engine, get_db, SessionLocal
from app.core import db_models
from app.core.dependencies import get_current_user
from app.core.security import decode_token
from app.core.email_service import send_density_alert_email
from app.api.auth_router import router as auth_router
from app.api.settings_router import router as settings_router
from app.api.settings_router import _get_or_create_settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Traffic Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(settings_router)

AVATAR_DIR = "uploaded_avatars"
os.makedirs(AVATAR_DIR, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")

UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SNAPSHOT_EVERY_N_FRAMES = 15


@app.get("/")
def root():
    return {"status": "AI Traffic Analyzer backend is running"}


@app.post("/api/upload")
async def upload_video(
    file: UploadFile = File(...),
    current_user: db_models.User = Depends(get_current_user),
):
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"video_id": file.filename, "path": save_path}


@app.get("/api/sessions")
def list_sessions(
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    sessions = (
        db.query(db_models.Session)
        .filter(db_models.Session.user_id == current_user.id)
        .order_by(db_models.Session.id.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "video_id": s.video_id,
            "started_at": s.started_at,
            "ended_at": s.ended_at,
            "total_crossed": s.total_crossed,
            "final_density": s.final_density,
        }
        for s in sessions
    ]


@app.get("/api/sessions/{session_id}")
def get_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    session = (
        db.query(db_models.Session)
        .filter(db_models.Session.id == session_id, db_models.Session.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    counts = db.query(db_models.VehicleCount).filter(db_models.VehicleCount.session_id == session_id).all()
    snapshots = (
        db.query(db_models.FrameSnapshot)
        .filter(db_models.FrameSnapshot.session_id == session_id)
        .order_by(db_models.FrameSnapshot.frame_index)
        .all()
    )

    return {
        "id": session.id,
        "video_id": session.video_id,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "total_crossed": session.total_crossed,
        "final_density": session.final_density,
        "counts_by_class": {c.class_name: c.count for c in counts},
        "trend": [
            {
                "frame_index": snap.frame_index,
                "active_vehicles": snap.active_vehicles,
                "avg_active_vehicles": snap.avg_active_vehicles,
                "density_level": snap.density_level,
            }
            for snap in snapshots
        ],
    }


@app.websocket("/ws/analytics/{video_id}")
async def analytics_ws(websocket: WebSocket, video_id: str, token: str = Query(...)):
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        await websocket.close(code=4401)
        return

    db = SessionLocal()
    user = db.query(db_models.User).filter(db_models.User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        await websocket.close(code=4401)
        db.close()
        return

    await websocket.accept()
    video_path = os.path.join(UPLOAD_DIR, video_id)

    if not os.path.exists(video_path):
        await websocket.send_json({"error": f"{video_id} not found. Upload it first via /api/upload"})
        await websocket.close()
        db.close()
        return

    # Load this user's saved settings and actually drive the pipeline with them,
    # instead of hardcoded constants.
    user_settings = _get_or_create_settings(db, user.id)

    # Naming note: DB's `moderate_threshold` is the avg-active-vehicle value at which
    # Moderate density BEGINS -- which is exactly pipeline.py's `light_threshold` param
    # (the upper bound of "Light"). Similarly DB's `heavy_threshold` maps to pipeline's
    # `moderate_threshold` param (the upper bound of "Moderate"). Same boundary, different
    # parameter name on each side.
    pipeline_kwargs = dict(
        line_y_ratio=user_settings.counting_line_position / 100,
        smoothing_window_seconds=user_settings.smoothing_window_seconds,
        light_threshold=user_settings.moderate_threshold,
        moderate_threshold=user_settings.heavy_threshold,
        confidence=max(0.05, 1 - (user_settings.detection_sensitivity / 100)),
    )

    db_session = db_models.Session(user_id=user.id, video_id=video_id, started_at=datetime.now(timezone.utc))
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    last_counts_by_class = {}
    last_density = None
    heavy_alert_sent = False

    try:
        for update in run_pipeline(video_path, **pipeline_kwargs):
            await websocket.send_json(update)

            last_counts_by_class = update["counts_by_class"]
            last_density = update["density_level"]

            # Real email alert: fire once per session, the first time Heavy density is reached
            if (
                last_density == "Heavy"
                and not heavy_alert_sent
                and user_settings.email_alerts_enabled
            ):
                heavy_alert_sent = True
                asyncio.create_task(
                    asyncio.to_thread(
                        send_density_alert_email, user.email, video_id, update["avg_active_vehicles"]
                    )
                )

            if update["frame_index"] % SNAPSHOT_EVERY_N_FRAMES == 0:
                db.add(db_models.FrameSnapshot(
                    session_id=db_session.id,
                    frame_index=update["frame_index"],
                    active_vehicles=update["active_vehicles"],
                    avg_active_vehicles=update["avg_active_vehicles"],
                    density_level=update["density_level"],
                    total_crossed_so_far=update["total_crossed"],
                ))
                db.commit()

            await asyncio.sleep(0)

        db_session.ended_at = datetime.now(timezone.utc)
        db_session.total_crossed = sum(last_counts_by_class.values())
        db_session.final_density = last_density
        db.add(db_session)

        for class_name, count in last_counts_by_class.items():
            db.add(db_models.VehicleCount(session_id=db_session.id, class_name=class_name, count=count))

        db.commit()

    except WebSocketDisconnect:
        print(f"Client disconnected while processing {video_id}")
    finally:
        db.close()
        await websocket.close()
