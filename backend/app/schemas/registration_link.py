from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date

# ==================== Registration Link Schemas ====================

class RegistrationLinkCreate(BaseModel):
    link_name: Optional[str] = None
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None

class RegistrationLinkResponse(BaseModel):
    id: int
    admin_id: int
    token: str
    link_name: Optional[str]
    is_active: bool
    expires_at: Optional[datetime]
    max_uses: Optional[int]
    use_count: int
    created_at: datetime
    updated_at: datetime
    full_url: Optional[str] = None  # Computed field

    class Config:
        from_attributes = True

class RegistrationLinkUpdate(BaseModel):
    link_name: Optional[str] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None

# ==================== Self Registration Schemas ====================

class SelfRegistrationPage1(BaseModel):
    """Page 1: Common Student Information"""
    student_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    national_id: str = Field(..., min_length=5, max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    phone_number: Optional[str] = Field(None, max_length=20)
    secondary_phone: Optional[str] = Field(None, max_length=20)
    current_living_address: Optional[str] = Field(None, max_length=255)
    home_town_address: Optional[str] = Field(None, max_length=255)
    religion: Optional[str] = Field(None, max_length=50)
    
    # Emergency and family info
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, max_length=20)
    parent_name: Optional[str] = Field(None, max_length=100)
    parent_phone: Optional[str] = Field(None, max_length=20)
    
    # Education background
    education_background: Optional[str] = Field(None, max_length=100)
    graduation_year: Optional[int] = None

class SelfRegistrationPage2(BaseModel):
    """Page 2: Japanese-related Information"""
    name_in_japanese: Optional[str] = Field(None, max_length=100)
    passport_number: Optional[str] = Field(None, max_length=50)
    current_japan_level: Optional[str] = Field(None, pattern="^(N1|N2|N3|N4|N5|Beginner)$")
    japan_travel_experience: bool = False
    coe_application_experience: bool = False
    passed_highest_jlpt_level: Optional[str] = Field(None, pattern="^(N1|N2|N3|N4|N5|None)$")
    
    # Job and study preferences
    desired_job_type: Optional[str] = Field(None, max_length=100)
    other_desired_job_type: Optional[str] = Field(None, max_length=100)
    desired_location_in_japan: Optional[str] = Field(None, max_length=100)
    intended_study_period: Optional[str] = Field(None, pattern="^(6_months|1_year|2_years|other)$")
    japanese_learning_history: Optional[str] = Field(None, max_length=255)
    
    # Personal preferences
    is_smoking: bool = False
    is_alcohol_drink: bool = False
    have_tatto: bool = False
    hostel_preference: bool = False
    
    # Additional notes
    memo_notes: Optional[str] = Field(None, max_length=2000)

class SelfRegistrationCreate(BaseModel):
    """Complete registration combining both pages"""
    token: str  # Registration link token
    page1: SelfRegistrationPage1
    page2: SelfRegistrationPage2

class SelfRegistrationResponse(BaseModel):
    id: int
    registration_link_id: int
    
    # Page 1 data
    student_name: str
    email: str
    national_id: str
    date_of_birth: Optional[date]
    gender: Optional[str]
    phone_number: Optional[str]
    secondary_phone: Optional[str]
    current_living_address: Optional[str]
    home_town_address: Optional[str]
    religion: Optional[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    parent_name: Optional[str]
    parent_phone: Optional[str]
    education_background: Optional[str]
    graduation_year: Optional[int]
    
    # Page 2 data
    name_in_japanese: Optional[str]
    passport_number: Optional[str]
    current_japan_level: Optional[str]
    japan_travel_experience: bool
    coe_application_experience: bool
    passed_highest_jlpt_level: Optional[str]
    desired_job_type: Optional[str]
    other_desired_job_type: Optional[str]
    desired_location_in_japan: Optional[str]
    intended_study_period: Optional[str]
    japanese_learning_history: Optional[str]
    is_smoking: bool
    is_alcohol_drink: bool
    have_tatto: bool
    hostel_preference: bool
    memo_notes: Optional[str]
    
    # Status
    status: str
    admin_notes: Optional[str]
    submitted_at: datetime
    reviewed_at: Optional[datetime]

    class Config:
        from_attributes = True

class SelfRegistrationUpdate(BaseModel):
    """For admin to update status and add notes"""
    status: Optional[str] = Field(None, pattern="^(PENDING|APPROVED|REJECTED)$")
    admin_notes: Optional[str] = Field(None, max_length=1000)

class SelfRegistrationListResponse(BaseModel):
    """Simplified response for listing"""
    id: int
    student_name: str
    email: str
    phone_number: Optional[str]
    current_japan_level: Optional[str]
    status: str
    submitted_at: datetime
    link_name: Optional[str] = None  # From registration link

    class Config:
        from_attributes = True
