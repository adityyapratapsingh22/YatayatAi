import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from app.core.database import get_db
from app.core import db_models
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_reset_token,
)
from app.core.email_service import send_password_reset_email
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ProfileStatsResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DBSession = Depends(get_db)):
    existing = db.query(db_models.User).filter(db_models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = db_models.User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DBSession = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been disabled")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: DBSession = Depends(get_db)):
    token_payload = decode_token(payload.refresh_token)

    if token_payload is None or token_payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user_id = int(token_payload["sub"])
    user = db.query(db_models.User).filter(db_models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: db_models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UpdateProfileRequest,
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    if payload.email != current_user.email:
        existing = db.query(db_models.User).filter(db_models.User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That email is already in use by another account")

    current_user.full_name = payload.full_name
    current_user.email = payload.email
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    contents = await file.read()
    max_size_bytes = 5 * 1024 * 1024  # 5MB
    if len(contents) > max_size_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image must be under 5MB")

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        ext = ".jpg"

    os.makedirs(settings.AVATAR_DIR, exist_ok=True)
    filename = f"user_{current_user.id}{ext}"
    filepath = os.path.join(settings.AVATAR_DIR, filename)

    # Clean up a previously uploaded avatar with a different extension, so re-uploading
    # a PNG after a JPG doesn't leave the old file orphaned on disk.
    if current_user.avatar_url:
        old_filename = os.path.basename(current_user.avatar_url)
        old_filepath = os.path.join(settings.AVATAR_DIR, old_filename)
        if old_filename != filename and os.path.exists(old_filepath):
            os.remove(old_filepath)

    with open(filepath, "wb") as f:
        f.write(contents)

    current_user.avatar_url = f"/avatars/{filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    payload: ChangePasswordRequest,
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(payload.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/me/stats", response_model=ProfileStatsResponse)
def get_my_stats(
    db: DBSession = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user),
):
    videos_analyzed = (
        db.query(func.count(db_models.Session.id))
        .filter(db_models.Session.user_id == current_user.id)
        .scalar()
    ) or 0

    total_vehicles = (
        db.query(func.coalesce(func.sum(db_models.Session.total_crossed), 0))
        .filter(db_models.Session.user_id == current_user.id)
        .scalar()
    ) or 0

    return ProfileStatsResponse(
        videos_analyzed=videos_analyzed,
        total_vehicles_counted=total_vehicles,
        member_since=current_user.created_at,
    )


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: ForgotPasswordRequest, db: DBSession = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.email == payload.email).first()

    if user:
        reset_token = generate_reset_token()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

        db.add(db_models.PasswordResetToken(user_id=user.id, token=reset_token, expires_at=expires_at))
        db.commit()

        send_password_reset_email(user.email, reset_token)

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest, db: DBSession = Depends(get_db)):
    reset_record = (
        db.query(db_models.PasswordResetToken)
        .filter(db_models.PasswordResetToken.token == payload.token)
        .first()
    )

    if not reset_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or unknown reset token")
    if reset_record.used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link has already been used")

    expires_at = reset_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link has expired")

    user = db.query(db_models.User).filter(db_models.User.id == reset_record.user_id).first()
    user.hashed_password = hash_password(payload.new_password)
    reset_record.used = True
    db.commit()

    return {"message": "Password has been reset successfully. You can now log in."}
