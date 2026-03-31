from sqlalchemy import Column, String, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class Teacher(Base):
    __tablename__ = "teachers"

    teacher_id = Column(BigInteger, primary_key=True, index=True)
    teacher_code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String)
    is_active = Column(Boolean, default=True)
    owner_admin_id = Column(BigInteger, ForeignKey("users.id"), index=True, nullable=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    owner_admin = relationship("User", foreign_keys=[owner_admin_id])
    user = relationship("User", foreign_keys=[user_id])
    courses = relationship("Course", back_populates="teacher")
    tests_created = relationship("Test", back_populates="created_by_teacher")
    test_results_graded = relationship("TestResult", back_populates="graded_by_teacher")
