from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core import db_models
from app.schemas.analytics_schemas import AnalyticsSummaryResponse, BusiestSession, SessionsOverTimePoint

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    user_sessions = db.query(db_models.Session).filter(db_models.Session.user_id == current_user.id)

    total_sessions = user_sessions.count()
    total_vehicles = (
        db.query(func.coalesce(func.sum(db_models.Session.total_crossed), 0))
        .filter(db_models.Session.user_id == current_user.id)
        .scalar()
    ) or 0

    average_per_session = round(total_vehicles / total_sessions, 1) if total_sessions > 0 else 0.0

    # Density distribution -- how many completed sessions landed in each congestion level
    density_rows = (
        db.query(db_models.Session.final_density, func.count(db_models.Session.id))
        .filter(db_models.Session.user_id == current_user.id, db_models.Session.final_density.isnot(None))
        .group_by(db_models.Session.final_density)
        .all()
    )
    density_distribution = {density: count for density, count in density_rows}

    # Class distribution -- summed across every vehicle ever counted, in every session
    class_rows = (
        db.query(db_models.VehicleCount.class_name, func.sum(db_models.VehicleCount.count))
        .join(db_models.Session, db_models.Session.id == db_models.VehicleCount.session_id)
        .filter(db_models.Session.user_id == current_user.id)
        .group_by(db_models.VehicleCount.class_name)
        .all()
    )
    class_distribution = {cls: int(total) for cls, total in class_rows}

    # Sessions over time -- vehicles crossed per calendar day, for a real activity trend
    time_rows = (
        db.query(func.date(db_models.Session.started_at), func.coalesce(func.sum(db_models.Session.total_crossed), 0))
        .filter(db_models.Session.user_id == current_user.id)
        .group_by(func.date(db_models.Session.started_at))
        .order_by(func.date(db_models.Session.started_at))
        .all()
    )
    sessions_over_time = [
        SessionsOverTimePoint(date=str(date), total_crossed=int(total)) for date, total in time_rows
    ]

    # Busiest single session, by vehicles crossed
    busiest = (
        db.query(db_models.Session)
        .filter(db_models.Session.user_id == current_user.id)
        .order_by(db_models.Session.total_crossed.desc())
        .first()
    )
    busiest_session = (
        BusiestSession(id=busiest.id, video_id=busiest.video_id, total_crossed=busiest.total_crossed or 0)
        if busiest and busiest.total_crossed
        else None
    )

    return AnalyticsSummaryResponse(
        total_sessions=total_sessions,
        total_vehicles_counted=total_vehicles,
        average_vehicles_per_session=average_per_session,
        density_distribution=density_distribution,
        class_distribution=class_distribution,
        sessions_over_time=sessions_over_time,
        busiest_session=busiest_session,
    )
