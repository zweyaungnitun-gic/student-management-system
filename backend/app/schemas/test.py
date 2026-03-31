from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TestBase(BaseModel):
    course_id: int
    test_name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    total_marks: int = Field(..., ge=1)
    passing_marks: int = Field(..., ge=0)
    test_date: datetime
    duration_minutes: int = Field(..., ge=1)

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    test_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    total_marks: Optional[int] = Field(None, ge=1)
    passing_marks: Optional[int] = Field(None, ge=0)
    test_date: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)

class TestResponse(TestBase):
    test_id: int
    course_name: Optional[str] = None
    course_code: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
