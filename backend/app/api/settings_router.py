from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core import db_models
from app.schemas.settings_schemas import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create_settings(db: DBSession, user_id: int) -> db_models.UserSettings:
    existing = db.query(db_models.UserSettings).filter(db_models.UserSettings.user_id == user_id).first()
    if existing:
        return existing

    # First time this user has touched settings -- create a row with the model's defaults
    new_settings = db_models.UserSettings(user_id=user_id)
    db.add(new_settings)
    db.commit()
    db.refresh(new_settings)
    return new_settings


@router.get("", response_model=SettingsResponse)
def get_settings(
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    return _get_or_create_settings(db, current_user.id)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdateRequest,
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    user_settings = _get_or_create_settings(db, current_user.id)

    user_settings.moderate_threshold = payload.moderate_threshold
    user_settings.heavy_threshold = payload.heavy_threshold
    user_settings.counting_line_position = payload.counting_line_position
    user_settings.smoothing_window_seconds = payload.smoothing_window_seconds
    user_settings.detection_sensitivity = payload.detection_sensitivity
    user_settings.email_alerts_enabled = payload.email_alerts_enabled

    db.add(user_settings)
    db.commit()
    db.refresh(user_settings)
    return user_settings
