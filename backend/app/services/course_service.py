from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.course import Course
from app.models.teacher import Teacher
from app.models.enrollment import Enrollment
from app.models.test import Test
from app.models.test_result import TestResult
from app.schemas.course import CourseCreate, CourseUpdate

class CourseService:
    @staticmethod
    def get_all_courses(db: Session) -> List[Course]:
        return db.query(Course).all()

    @staticmethod
    def get_active_courses(db: Session) -> List[Course]:
        return db.query(Course).filter(Course.is_active == True).all()

    @staticmethod
    def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
        return db.query(Course).filter(Course.id == course_id).first()

    @staticmethod
    def get_course_by_code(db: Session, course_code: str) -> Optional[Course]:
        return db.query(Course).filter(Course.course_code == course_code).first()

    @staticmethod
    def create_course(db: Session, course_in: CourseCreate) -> Course:
        db_course = Course(**course_in.model_dump())
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course

    @staticmethod
    def update_course(db: Session, course_id: int, course_in: CourseUpdate) -> Optional[Course]:
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return None
        
        update_data = course_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_course, key, value)
        
        db.commit()
        db.refresh(db_course)
        return db_course

    @staticmethod
    def delete_course(db: Session, course_id: int) -> bool:
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return False
        
        # In Spring Boot, it deactivates instead of deleting if there are enrollments
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
        if enrollments:
            db_course.is_active = False
            db.commit()
            return True # Successfully "deactivated"
            
        db.delete(db_course)
        db.commit()
        return True

    @staticmethod
    def search_courses(db: Session, search: str) -> List[Course]:
        if not search:
            return CourseService.get_all_courses(db)
        return db.query(Course).filter(
            (Course.course_name.ilike(f"%{search}%")) | 
            (Course.course_code.ilike(f"%{search}%"))
        ).all()

    @staticmethod
    def get_courses_by_teacher(db: Session, teacher_id: int) -> List[Course]:
        return db.query(Course).filter(Course.teacher_id == teacher_id).all()

    @staticmethod
    def get_enrollments_by_course(db: Session, course_id: int) -> List[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.course_id == course_id).all()

    @staticmethod
    def get_tests_by_course(db: Session, course_id: int) -> List[Test]:
        return db.query(Test).filter(Test.course_id == course_id).all()

    @staticmethod
    def get_average_score(db: Session, course_id: int) -> Optional[float]:
        # Logic from Spring Boot TestResultRepository
        result = db.query(func.avg(TestResult.marks_obtained)).join(Test).filter(Test.course_id == course_id).scalar()
        return result
