from pydantic import BaseModel


class BusiestSession(BaseModel):
    id: int
    video_id: str
    total_crossed: int


class SessionsOverTimePoint(BaseModel):
    date: str
    total_crossed: int


class AnalyticsSummaryResponse(BaseModel):
    total_sessions: int
    total_vehicles_counted: int
    average_vehicles_per_session: float
    density_distribution: dict[str, int]
    class_distribution: dict[str, int]
    sessions_over_time: list[SessionsOverTimePoint]
    busiest_session: BusiestSession | None
