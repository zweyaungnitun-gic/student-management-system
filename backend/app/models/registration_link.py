from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class RegistrationLink(Base):
    __tablename__ = "registration_links"

    id = Column(BigInteger, primary_key=True, index=True)
    admin_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    link_name = Column(String(100), nullable=True)  # Optional name for the link (e.g., "2024 Spring Intake")
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    max_uses = Column(Integer, nullable=True)  # Optional usage limit
    use_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    admin = relationship("User", back_populates="registration_links")
    registrations = relationship("SelfRegistration", back_populates="registration_link")

class SelfRegistration(Base):
    """Pending student registrations via public link - to be reviewed by admin"""
    __tablename__ = "self_registrations"

    id = Column(BigInteger, primary_key=True, index=True)
    registration_link_id = Column(BigInteger, ForeignKey("registration_links.id"), nullable=False)
    
    # Common Student Info (Page 1)
    student_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    national_id = Column(String, nullable=False)
    date_of_birth = Column(DateTime)
    gender = Column(String)
    phone_number = Column(String)
    secondary_phone = Column(String)
    current_living_address = Column(String)
    home_town_address = Column(String)
    religion = Column(String)
    
    # Additional useful fields
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    parent_name = Column(String)
    parent_phone = Column(String)
    education_background = Column(String)  # High school, University, etc.
    graduation_year = Column(Integer)
    
    # Japanese Info (Page 2)
    name_in_japanese = Column(String)
    passport_number = Column(String)
    current_japan_level = Column(String)  # N5, N4, N3, N2, N1, Beginner
    japan_travel_experience = Column(Boolean, default=False)
    coe_application_experience = Column(Boolean, default=False)
    passed_highest_jlpt_level = Column(String)
    
    # Additional Japanese fields
    desired_job_type = Column(String)
    other_desired_job_type = Column(String)
    desired_location_in_japan = Column(String)  # Tokyo, Osaka, etc.
    intended_study_period = Column(String)  # 6 months, 1 year, 2 years
    japanese_learning_history = Column(String)  # Self-study, School, etc.
    
    # Personal preferences
    is_smoking = Column(Boolean, default=False)
    is_alcohol_drink = Column(Boolean, default=False)
    have_tatto = Column(Boolean, default=False)
    hostel_preference = Column(Boolean, default=False)
    
    # Status and notes
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    admin_notes = Column(String(1000))
    memo_notes = Column(String(2000))
    
    # Tracking
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(BigInteger, ForeignKey("users.id"))
    
    # Relationships
    registration_link = relationship("RegistrationLink", back_populates="registrations")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
