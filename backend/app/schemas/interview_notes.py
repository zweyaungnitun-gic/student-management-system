from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InterviewNotesBase(BaseModel):
    registration_id: int
    interviewer_id: int
    notes: str = Field(..., max_length=1000)
    recommendation: Optional[str] = Field(None, max_length=200)
    interview_date: datetime

class InterviewNotesCreate(InterviewNotesBase):
    pass

class InterviewNotesUpdate(BaseModel):
    notes: Optional[str] = Field(None, max_length=1000)
    recommendation: Optional[str] = Field(None, max_length=200)

class InterviewNotesResponse(InterviewNotesBase):
    id: int
    interviewer_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
