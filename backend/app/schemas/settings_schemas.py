from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    moderate_threshold: float
    heavy_threshold: float
    counting_line_position: float
    smoothing_window_seconds: float
    detection_sensitivity: float
    email_alerts_enabled: bool

    class Config:
        from_attributes = True


class SettingsUpdateRequest(BaseModel):
    moderate_threshold: float = Field(gt=0, le=200)
    heavy_threshold: float = Field(gt=0, le=200)
    counting_line_position: float = Field(ge=0, le=100)
    smoothing_window_seconds: float = Field(ge=0.5, le=30)
    detection_sensitivity: float = Field(ge=0, le=100)
    email_alerts_enabled: bool
