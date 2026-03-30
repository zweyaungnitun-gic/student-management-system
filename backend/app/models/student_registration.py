from sqlalchemy import Column, String, Date, BigInteger, Boolean, Enum as SQLEnum
from app.database import Base
from app.models.student import RegistrationStatus

class StudentRegistration(Base):
    __tablename__ = "registration_list"

    id = Column(BigInteger, primary_key=True, index=True)
    registration_code = Column(String, unique=True, nullable=False)
    registration_status = Column(SQLEnum(RegistrationStatus, name="registration_status_enum_reg"), nullable=False, default=RegistrationStatus.PENDING)
    submitted_at = Column(Date, nullable=False)
    decided_at = Column(Date)
    decided_by = Column(String)
    accepted_student_id = Column(String)

    english_name = Column(String, nullable=False)
    katakana_name = Column(String)
    date_of_birth = Column(Date)
    gender = Column(String)
    current_address = Column(String)
    hometown_address = Column(String)
    phone_number = Column(String)
    guardian_phone_number = Column(String)

    father_name = Column(String)
    passport_number = Column(String)
    national_id_number = Column(String, unique=True, nullable=False)
    jlpt_level = Column(String)
    desired_occupation = Column(String)
    other_occupation = Column(String)
    japan_travel_experience = Column(Boolean)
    coe_application_experience = Column(Boolean)

    religion = Column(String)
    other_religion = Column(String)
    smoking = Column(Boolean)
    alcohol = Column(Boolean)
    tattoo = Column(Boolean)
    tuition_payment_date = Column(Date)
    want_dorm = Column(Boolean)
    other_memo = Column(String(2000))
