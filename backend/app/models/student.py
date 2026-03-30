from sqlalchemy import Column, Integer, String, Date, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from sqlalchemy import Enum as SQLEnum

class RegistrationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    ENROLLED = "ENROLLED"
    COMPLETED = "COMPLETED"

class Student(Base):
    __tablename__ = "common_students"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(String, unique=True, nullable=False)
    student_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    gender = Column(String)
    current_living_address = Column(String)
    home_town_address = Column(String)
    phone_number = Column(String)
    national_id = Column(String, unique=True, nullable=False)
    religion = Column(String)
    enrolled_date = Column(Date)
    created_at = Column(Date)
    updated_at = Column(Date)
    registration_status = Column(SQLEnum(RegistrationStatus, name="registration_status_enum"), nullable=False, default=RegistrationStatus.ACCEPTED)
    created_by = Column(BigInteger)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", lazy="dynamic")
    additional_info = relationship("AdditionalStudentInfo", back_populates="common_student", uselist=False)
    interview_notes = relationship("InterviewNotes", back_populates="student", uselist=False)
