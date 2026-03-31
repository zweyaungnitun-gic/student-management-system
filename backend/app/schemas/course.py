from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CourseBase(BaseModel):
    course_code: str = Field(..., max_length=20)
    course_name: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    credit_hours: int = Field(..., ge=1)
    teacher_id: Optional[int] = None
    is_active: bool = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    course_code: Optional[str] = Field(None, max_length=20)
    course_name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    credit_hours: Optional[int] = Field(None, ge=1)
    teacher_id: Optional[int] = None
    is_active: Optional[bool] = None

class CourseResponse(CourseBase):
    course_id: int
    teacher_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
