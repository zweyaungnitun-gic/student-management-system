from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TestResultBase(BaseModel):
    test_id: int
    student_id: int
    marks_obtained: int = Field(..., ge=0)
    remarks: Optional[str] = Field(None, max_length=200)

class TestResultCreate(TestResultBase):
    pass

class TestResultUpdate(BaseModel):
    marks_obtained: Optional[int] = Field(None, ge=0)
    remarks: Optional[str] = Field(None, max_length=200)

class TestResultResponse(TestResultBase):
    id: int
    test_name: Optional[str] = None
    student_name: Optional[str] = None
    test_date: Optional[datetime] = None
    is_passed: bool
    created_at: datetime

    class Config:
        from_attributes = True
