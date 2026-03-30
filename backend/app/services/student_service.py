from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.models.student import Student
from app.models.additional_student_info import AdditionalStudentInfo
from app.schemas.student import StudentCreate, StudentUpdate

class StudentService:
    @staticmethod
    def generate_student_id(db: Session) -> str:
        # Find the highest existing student ID
        max_id = db.query(func.max(Student.student_id)).scalar()
        
        if not max_id or not max_id.startswith("STU"):
            return "STU001"
            
        try:
            numeric_part = max_id[3:]
            next_num = int(numeric_part) + 1
            return f"STU{next_num:03d}"
        except:
            count = db.query(Student).count() + 1
            return f"STU{count:03d}"

    @staticmethod
    def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[Student]:
        return db.query(Student).offset(skip).limit(limit).all()

    @staticmethod
    def get_student_by_id(db: Session, student_id: int) -> Optional[Student]:
        return db.query(Student).filter(Student.id == student_id).first()

    @staticmethod
    def get_student_by_code(db: Session, student_code: str) -> Optional[Student]:
        return db.query(Student).filter(Student.student_id == student_code).first()

    @staticmethod
    def create_student(db: Session, student_in: StudentCreate, created_by: int) -> Student:
        student_data = student_in.model_dump(exclude={"additional_info"})
        
        # Generate student ID if not provided
        student_id_code = StudentService.generate_student_id(db)
        
        db_student = Student(
            **student_data,
            student_id=student_id_code,
            created_by=created_by,
            created_at=date.today()
        )
        db.add(db_student)
        db.flush()
        
        if student_in.additional_info:
            add_info_data = student_in.additional_info.model_dump(exclude_unset=True)
            db_additional = AdditionalStudentInfo(
                common_student_id=db_student.id,
                **add_info_data
            )
            db.add(db_additional)
            
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def update_student(db: Session, student_id: int, student_in: StudentUpdate) -> Optional[Student]:
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if not db_student:
            return None
            
        update_data = student_in.model_dump(exclude_unset=True, exclude={"additional_info"})
        for key, value in update_data.items():
            setattr(db_student, key, value)
            
        if student_in.additional_info:
            add_info_data = student_in.additional_info.model_dump(exclude_unset=True)
            if db_student.additional_info:
                for key, value in add_info_data.items():
                    setattr(db_student.additional_info, key, value)
            else:
                db_additional = AdditionalStudentInfo(
                    common_student_id=db_student.id,
                    **add_info_data
                )
                db.add(db_additional)
                
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def delete_student(db: Session, student_id: int) -> bool:
        db_student = db.query(Student).filter(Student.id == student_id).first()
        if not db_student:
            return False
            
        db.delete(db_student)
        db.commit()
        return True
