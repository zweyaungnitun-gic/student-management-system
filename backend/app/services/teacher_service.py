from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate

class TeacherService:
    @staticmethod
    def get_all_teachers(db: Session, search: Optional[str] = None) -> List[Teacher]:
        query = db.query(Teacher)
        if search:
            query = query.filter(
                (Teacher.name.ilike(f"%{search}%")) | 
                (Teacher.email.ilike(f"%{search}%"))
            )
        return query.all()

    @staticmethod
    def get_teacher_by_id(db: Session, teacher_id: int) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.id == teacher_id).first()

    @staticmethod
    def get_teacher_by_email(db: Session, email: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.email == email).first()

    @staticmethod
    def create_teacher(db: Session, teacher_in: TeacherCreate) -> Teacher:
        db_teacher = Teacher(**teacher_in.model_dump())
        # Generate teacher code if needed - logic usually in repository or entity in Spring Boot
        # Assuming database provides it or entity handles it
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher

    @staticmethod
    def update_teacher(db: Session, teacher_id: int, teacher_in: TeacherUpdate) -> Optional[Teacher]:
        db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not db_teacher:
            return None
        
        update_data = teacher_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher, key, value)
        
        db.commit()
        db.refresh(db_teacher)
        return db_teacher

    @staticmethod
    def deactivate_teacher(db: Session, teacher_id: int) -> bool:
        db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not db_teacher:
            return False
        
        db_teacher.is_active = False
        db.commit()
        return True

    @staticmethod
    def activate_teacher(db: Session, teacher_id: int) -> bool:
        db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not db_teacher:
            return False
        
        db_teacher.is_active = True
        db.commit()
        return True
