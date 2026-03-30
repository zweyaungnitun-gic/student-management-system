from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class TeacherBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr = Field(..., max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    is_active: bool = True

class TeacherCreate(TeacherBase):
    pass

class TeacherUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class TeacherResponse(TeacherBase):
    id: int
    teacher_code: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
