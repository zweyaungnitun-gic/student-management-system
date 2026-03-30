from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date
import re

class RegistrationBase(BaseModel):
    english_name: str = Field(..., max_length=100)
    katakana_name: str = Field(..., max_length=100)
    dob: date
    gender: str = Field(..., pattern="^(男性|女性)$")
    current_address: str = Field(..., max_length=200)
    hometown_address: str = Field(..., max_length=200)
    phone_number: str = Field(..., pattern="^(\\+?959|09)\\d{7,9}$")
    guardian_phone_number: str = Field(..., pattern="^(\\+?959|09)\\d{7,9}$")
    father_name: str = Field(..., max_length=100)
    passport_number: Optional[str] = Field(None, pattern="^$|^[A-Z]{1,2}[0-9]{6}$")
    national_id_number: str = Field(..., pattern="^\\d{1,2}/[A-Za-z]{3,9}\\([A-Z]\\)\\d{6}$")
    jlpt_level: Optional[str] = None
    desired_occupation: Optional[str] = None
    japan_travel_experience: bool = False
    coe_application_experience: bool = False
    status: str = Field("pending", max_length=20)

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20)
    other_memo: Optional[str] = None

class RegistrationResponse(RegistrationBase):
    id: int
    created_at: date

    class Config:
        from_attributes = True
