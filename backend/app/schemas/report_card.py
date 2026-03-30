from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReportCardBase(BaseModel):
    student_id: int
    semester: str = Field(..., max_length=50)
    total_gpa: float = Field(..., ge=0.0, le=4.0)
    remarks: Optional[str] = Field(None, max_length=500)

class ReportCardCreate(ReportCardBase):
    pass

class ReportCardUpdate(BaseModel):
    total_gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    remarks: Optional[str] = Field(None, max_length=500)

class ReportCardResponse(ReportCardBase):
    id: int
    student_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
