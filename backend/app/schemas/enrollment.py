from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    semester: Optional[str] = Field(None, max_length=50)
    status: str = Field("pending", max_length=20)

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20)
    semester: Optional[str] = Field(None, max_length=50)

class EnrollmentResponse(EnrollmentBase):
    enrollment_id: int
    student_name: Optional[str] = None
    student_id_number: Optional[str] = None
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    enrolled_date: Optional[datetime] = None
    enrollment_date: Optional[datetime] = None
    enrollment_request_date: Optional[datetime] = None

    class Config:
        from_attributes = True