from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class Session(Base):
    """One row per video processed -- the parent record for that run's analytics."""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String, nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime, nullable=True)
    total_crossed = Column(Integer, default=0)
    final_density = Column(String, nullable=True)

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
