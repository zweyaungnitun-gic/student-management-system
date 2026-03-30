from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.enrollment import Enrollment
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate

class EnrollmentService:
    @staticmethod
    def get_all_enrollments(db: Session, student_id: Optional[int] = None, course_id: Optional[int] = None) -> List[Enrollment]:
        query = db.query(Enrollment)
        if student_id:
            query = query.filter(Enrollment.student_id == student_id)
        if course_id:
            query = query.filter(Enrollment.course_id == course_id)
        return query.all()

    @staticmethod
    def get_enrollment_by_id(db: Session, enrollment_id: int) -> Optional[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    @staticmethod
    def create_enrollment(db: Session, enrollment_in: EnrollmentCreate) -> Enrollment:
        db_enrollment = Enrollment(**enrollment_in.model_dump())
        db.add(db_enrollment)
        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment

    @staticmethod
    def update_enrollment_status(db: Session, enrollment_id: int, status: str) -> Optional[Enrollment]:
        db_enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if not db_enrollment:
            return None
        
        db_enrollment.status = status
        db.commit()
        db.refresh(db_enrollment)
        return db_enrollment

    @staticmethod
    def delete_enrollment(db: Session, enrollment_id: int) -> bool:
        db_enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if not db_enrollment:
            return False
        
        db.delete(db_enrollment)
        db.commit()
        return True
