from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum

class RegistrationStatusEnum(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    ENROLLED = "ENROLLED"
    COMPLETED = "COMPLETED"

class StudentBase(BaseModel):
    student_name: str
    national_id: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    current_living_address: Optional[str] = None
    home_town_address: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(StudentBase):
    registration_status: Optional[RegistrationStatusEnum] = None
    student_name: Optional[str] = None
    national_id: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    student_id: str
    registration_status: RegistrationStatusEnum
    enrolled_date: Optional[date]
    created_at: Optional[date]

    class Config:
        from_attributes = True
