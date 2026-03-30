from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.models.student_registration import StudentRegistration
from app.models.student import Student
from app.models.additional_student_info import AdditionalStudentInfo
from app.schemas.registration import RegistrationCreate, RegistrationUpdate

class RegistrationService:
    @staticmethod
    def generate_registration_code(db: Session) -> str:
        prefix = "REG-"
        count = db.query(StudentRegistration).count() + 1
        code = f"{prefix}{count:06d}"
        while db.query(StudentRegistration).filter(StudentRegistration.registration_code == code).first():
            count += 1
            code = f"{prefix}{count:06d}"
        return code

    @staticmethod
    def submit_registration(db: Session, reg_in: RegistrationCreate) -> StudentRegistration:
        # Check national ID uniqueness
        if db.query(StudentRegistration).filter(StudentRegistration.national_id_number == reg_in.national_id_number).first():
            raise Exception("この国民ID番号は既に登録されています")
        
        db_reg = StudentRegistration(
            **reg_in.model_dump(),
            registration_code=RegistrationService.generate_registration_code(db),
            status="pending",
            submitted_at=date.today()
        )
        db.add(db_reg)
        db.commit()
        db.refresh(db_reg)
        return db_reg

    @staticmethod
    def get_registrations(db: Session, status: Optional[str] = None, search: Optional[str] = None) -> List[StudentRegistration]:
        query = db.query(StudentRegistration)
        if status:
            query = query.filter(StudentRegistration.status == status)
        if search:
            query = query.filter(StudentRegistration.english_name.ilike(f"%{search}%"))
        return query.order_by(StudentRegistration.submitted_at.desc()).all()

    @staticmethod
    def get_registration_by_id(db: Session, reg_id: int) -> Optional[StudentRegistration]:
        return db.query(StudentRegistration).filter(StudentRegistration.id == reg_id).first()

    @staticmethod
    def update_registration(db: Session, reg_id: int, reg_in: RegistrationUpdate) -> Optional[StudentRegistration]:
        db_reg = db.query(StudentRegistration).filter(StudentRegistration.id == reg_id).first()
        if not db_reg:
            return None
        
        update_data = reg_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_reg, key, value)
        
        db.commit()
        db.refresh(db_reg)
        return db_reg

    @staticmethod
    def accept_registration(db: Session, reg_id: int, decided_by: int) -> Optional[StudentRegistration]:
        from app.services.student_service import StudentService
        db_reg = db.query(StudentRegistration).filter(StudentRegistration.id == reg_id).first()
        if not db_reg or db_reg.status != "pending":
            return None
        
        # 1. Create Student
        # Mapping fields from registration to student
        student_id_code = StudentService.generate_student_id(db)
        db_student = Student(
            student_id=student_id_code,
            student_name=db_reg.english_name,
            gender=db_reg.gender,
            phone_number=db_reg.phone_number,
            national_id=db_reg.national_id_number,
            religion=db_reg.religion,
            current_living_address=db_reg.current_address,
            home_town_address=db_reg.hometown_address,
            date_of_birth=db_reg.dob,
            enrolled_date=date.today(),
            created_by=decided_by,
            created_at=date.today()
        )
        db.add(db_student)
        db.flush() # Get student PK id
        
        # 2. Create Additional Info
        db_additional = AdditionalStudentInfo(
            common_student_id=db_student.id,
            name_in_japanese=db_reg.katakana_name,
            passport_number=db_reg.passport_number,
            current_japan_level=db_reg.jlpt_level,
            japan_travel_experience=db_reg.japan_travel_experience,
            coe_application_experience=db_reg.coe_application_experience,
            secondary_phone=db_reg.guardian_phone_number,
            father_name=db_reg.father_name,
            desired_job_type=db_reg.desired_occupation,
            is_smoking=db_reg.smoking,
            is_alcohol_drink=db_reg.alcohol,
            have_tatto=db_reg.tattoo,
            hostel_preference=db_reg.want_dorm,
            memo_notes=db_reg.other_memo
        )
        db.add(db_additional)
        
        # 3. Update Registration status
        db_reg.status = "accepted"
        db_reg.decided_at = date.today()
        db_reg.decided_by = decided_by
        db_reg.accepted_student_id = db_student.student_id # The STU-XXX code
        
        db.commit()
        db.refresh(db_reg)
        return db_reg

    @staticmethod
    def reject_registration(db: Session, reg_id: int, decided_by: int) -> Optional[StudentRegistration]:
        db_reg = db.query(StudentRegistration).filter(StudentRegistration.id == reg_id).first()
        if not db_reg or db_reg.status != "pending":
            return None
        
        db_reg.status = "rejected"
        db_reg.decided_at = date.today()
        db_reg.decided_by = decided_by
        
        db.commit()
        db.refresh(db_reg)
        return db_reg

    @staticmethod
    def count_by_status(db: Session, status: str) -> int:
        return db.query(StudentRegistration).filter(StudentRegistration.status == status).count()
