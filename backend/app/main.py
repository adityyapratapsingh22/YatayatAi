import os
import shutil
import asyncio
from datetime import datetime, timezone

from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession

from app.core.pipeline import run_pipeline
from app.core.database import Base, engine, get_db
from app.core import db_models

# Creates the sessions / frame_snapshots / vehicle_counts tables if they don't exist yet.
# Safe to call every startup -- it does nothing if the tables are already there.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Traffic Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_videos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Only write a snapshot to the DB every N frames -- writing every single frame to
# SQLite over a long video is wasteful; this still gives plenty of resolution for
# a historical trend chart later.
SNAPSHOT_EVERY_N_FRAMES = 15


@app.get("/")
def root():
    return {"status": "AI Traffic Analyzer backend is running"}


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"video_id": file.filename, "path": save_path}


@app.get("/api/sessions")
def list_sessions(db: DBSession = Depends(get_db)):
    """Returns every past processing session -- the historical record."""
    sessions = db.query(db_models.Session).order_by(db_models.Session.id.desc()).all()
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
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    """Returns full detail for one session: per-class counts and the frame-by-frame trend."""
    session = db.query(db_models.Session).filter(db_models.Session.id == session_id).first()
    if not session:
        return {"error": f"Session {session_id} not found"}

    counts = db.query(db_models.VehicleCount).filter(
        db_models.VehicleCount.session_id == session_id
    ).all()
    snapshots = db.query(db_models.FrameSnapshot).filter(
        db_models.FrameSnapshot.session_id == session_id
    ).order_by(db_models.FrameSnapshot.frame_index).all()

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
async def analytics_ws(websocket: WebSocket, video_id: str):
    await websocket.accept()
    video_path = os.path.join(UPLOAD_DIR, video_id)

    if not os.path.exists(video_path):
        await websocket.send_json({"error": f"{video_id} not found. Upload it first via /api/upload"})
        await websocket.close()
        return

    # Open a DB session manually here since this isn't a normal request (can't use Depends
    # inside a WebSocket route the same way) -- we're responsible for closing it ourselves.
    from app.core.database import SessionLocal
    db = SessionLocal()

    db_session = db_models.Session(video_id=video_id, started_at=datetime.now(timezone.utc))
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    last_counts_by_class = {}
    last_density = None

    try:
        for update in run_pipeline(video_path):
            await websocket.send_json(update)

            last_counts_by_class = update["counts_by_class"]
            last_density = update["density_level"]

            if update["frame_index"] % SNAPSHOT_EVERY_N_FRAMES == 0:
                snapshot = db_models.FrameSnapshot(
                    session_id=db_session.id,
                    frame_index=update["frame_index"],
                    active_vehicles=update["active_vehicles"],
                    avg_active_vehicles=update["avg_active_vehicles"],
                    density_level=update["density_level"],
                    total_crossed_so_far=update["total_crossed"],
                )
                db.add(snapshot)
                db.commit()

            await asyncio.sleep(0)

        # Video finished processing -- finalize the session record
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
