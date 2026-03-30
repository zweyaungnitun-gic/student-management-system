from sqlalchemy import Column, String, BigInteger, Boolean, DateTime
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
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)

    courses = relationship("Course", back_populates="teacher")
    tests_created = relationship("Test", back_populates="created_by_teacher")
    test_results_graded = relationship("TestResult", back_populates="graded_by_teacher")
