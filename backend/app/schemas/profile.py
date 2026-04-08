from app.models.user import SkillLevel
from pydantic import BaseModel


class BackgroundProfileUpdate(BaseModel):
    python_level: SkillLevel
    ros_level: SkillLevel
    ml_ai_level: SkillLevel
    simulation_level: SkillLevel
    has_gpu: bool
    has_robot_kit: bool
    has_sensors: bool


class BackgroundProfileResponse(BaseModel):
    python_level: SkillLevel
    ros_level: SkillLevel
    ml_ai_level: SkillLevel
    simulation_level: SkillLevel
    has_gpu: bool
    has_robot_kit: bool
    has_sensors: bool

    model_config = {"from_attributes": True}
