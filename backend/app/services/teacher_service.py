from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate
from app.models.user import User, Role
from app.core.security import get_password_hash
from app.services.user_service import UserService

class TeacherService:
    @staticmethod
    def get_all_teachers(db: Session, search: Optional[str] = None, owner_admin_id: Optional[int] = None) -> List[Teacher]:
        query = db.query(Teacher)
        if owner_admin_id is not None:
            query = query.filter(Teacher.owner_admin_id == owner_admin_id)
        if search:
            query = query.filter(
                (Teacher.name.ilike(f"%{search}%")) | 
                (Teacher.email.ilike(f"%{search}%"))
            )
        return query.all()

    @staticmethod
    def get_teacher_by_id(db: Session, teacher_id: int) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()

    @staticmethod
    def get_teacher_by_email(db: Session, email: str) -> Optional[Teacher]:
        return db.query(Teacher).filter(Teacher.email == email).first()

    @staticmethod
    def create_teacher(db: Session, teacher_in: TeacherCreate, owner_admin_id: Optional[int] = None) -> Teacher:
        import time
        
        # Generate teacher code similar to Java entity
        teacher_code = f"TCH{int(time.time() * 1000) % 1000:03d}"
        
        db_teacher = Teacher(
            teacher_code=teacher_code,
            **teacher_in.model_dump(),
            owner_admin_id=owner_admin_id
        )
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
        return db_teacher

    @staticmethod
    def create_teacher_login(db: Session, teacher_id: int, username: str, password: str) -> Optional[User]:
        teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
        if not teacher:
            return None

        # If login already exists, return existing user.
        if teacher.user_id:
            return db.query(User).filter(User.id == teacher.user_id).first()

        # Prevent duplicate usernames/emails.
        if db.query(User).filter(User.username == username).first():
            raise Exception("Username already exists")
        if db.query(User).filter(User.email == teacher.email).first():
            raise Exception("Email already exists")

        db_user = User(
            user_id=UserService.generate_user_id(db),
            username=username,
            email=teacher.email,
            password=get_password_hash(password),
            role=Role.TEACHER,
        )
        db.add(db_user)
        db.flush()

        teacher.user_id = db_user.id
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_teacher(db: Session, teacher_id: int, teacher_in: TeacherUpdate) -> Optional[Teacher]:
        db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
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
        db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
        if not db_teacher:
            return False
        
        db_teacher.is_active = False
        db.commit()
        return True

    @staticmethod
    def activate_teacher(db: Session, teacher_id: int) -> bool:
        db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
        if not db_teacher:
            return False
        
        db_teacher.is_active = True
        db.commit()
        return True
