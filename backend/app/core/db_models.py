from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """A registered account. Sessions and settings are tied to a user."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sessions = relationship("Session", back_populates="user")
    reset_tokens = relationship("PasswordResetToken", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)


class PasswordResetToken(Base):
    """A single-use, expiring token issued when a user requests a password reset."""
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reset_tokens")


class UserSettings(Base):
    """Per-user pipeline configuration. One row per user, created with defaults on first access."""
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    moderate_threshold = Column(Float, default=5.0)
    heavy_threshold = Column(Float, default=12.0)
    counting_line_position = Column(Float, default=65.0)
    smoothing_window_seconds = Column(Float, default=2.0)
    detection_sensitivity = Column(Float, default=85.0)  # maps to conf=0.15 (1 - 85/100)
    email_alerts_enabled = Column(Boolean, default=False)

    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="settings")


class Session(Base):
    """One row per video processed -- the parent record for that run's analytics."""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    video_id = Column(String, nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)
    total_crossed = Column(Integer, default=0)
    final_density = Column(String, nullable=True)

    user = relationship("User", back_populates="sessions")
    snapshots = relationship("FrameSnapshot", back_populates="session")
    vehicle_counts = relationship("VehicleCount", back_populates="session")


class FrameSnapshot(Base):
    """Periodic analytics readings taken during processing -- powers historical trend charts."""
    __tablename__ = "frame_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    frame_index = Column(Integer)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    active_vehicles = Column(Integer)
    avg_active_vehicles = Column(Float)
    density_level = Column(String)
    total_crossed_so_far = Column(Integer)

    session = relationship("Session", back_populates="snapshots")


class VehicleCount(Base):
    """Final per-class totals for a session -- one row per vehicle class."""
    __tablename__ = "vehicle_counts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    class_name = Column(String)
    count = Column(Integer)

    session = relationship("Session", back_populates="vehicle_counts")
