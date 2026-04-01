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

class AdditionalStudentInfoBase(BaseModel):
    name_in_japanese: Optional[str] = None
    passport_number: Optional[str] = None
    current_japan_level: Optional[str] = None
    japan_travel_experience: Optional[bool] = False
    coe_application_experience: Optional[bool] = False
    passed_highest_jlpt_level: Optional[str] = None
    secondary_phone: Optional[str] = None
    father_name: Optional[str] = None
    desired_job_type: Optional[str] = None
    other_desired_job_type: Optional[str] = None
    is_smoking: Optional[bool] = False
    is_alcohol_drink: Optional[bool] = False
    have_tatto: Optional[bool] = False
    hostel_preference: Optional[bool] = False
    memo_notes: Optional[str] = None
    attending_class_related_status: Optional[str] = None
    contact_viber: Optional[str] = None
    schedule_payment_tution_date: Optional[date] = None
    actual_tution_payment_date: Optional[date] = None
    other_religion: Optional[str] = None

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    student_name: str
    national_id: str
    email: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    current_living_address: Optional[str] = None
    home_town_address: Optional[str] = None
    religion: Optional[str] = None
    additional_info: Optional[AdditionalStudentInfoBase] = None

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
