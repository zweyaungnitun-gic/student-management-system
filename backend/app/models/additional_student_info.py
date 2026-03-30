from sqlalchemy import Column, Integer, String, Date, BigInteger, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class AdditionalStudentInfo(Base):
    __tablename__ = "additional_student_info"

    id = Column(BigInteger, primary_key=True, index=True)
    common_student_id = Column(BigInteger, ForeignKey("common_students.id"), nullable=False, unique=True)
    
    name_in_japanese = Column(String)
    passport_number = Column(String)
    current_japan_level = Column(String)
    japan_travel_experience = Column(Boolean)
    coe_application_experience = Column(Boolean)
    passed_highest_jlpt_level = Column(String)
    
    secondary_phone = Column(String)
    father_name = Column(String)
    
    desired_job_type = Column(String)
    other_desired_job_type = Column(String)
    is_smoking = Column(Boolean)
    is_alcohol_drink = Column(Boolean)
    have_tatto = Column(Boolean)
    hostel_preference = Column(Boolean)
    memo_notes = Column(String(2000))
    attending_class_related_status = Column(String)
    contact_viber = Column(String)
    schedule_payment_tution_date = Column(Date)
    actual_tution_payment_date = Column(Date)
    other_religion = Column(String)

    common_student = relationship("Student", back_populates="additional_info")
