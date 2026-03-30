from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(BigInteger, primary_key=True, index=True)
    course_code = Column(String, nullable=False, unique=True)
    course_name = Column(String, nullable=False)
    description = Column(String(500))
    credit_hours = Column(Integer)
    teacher_id = Column(BigInteger, ForeignKey("teachers.teacher_id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    teacher = relationship("Teacher", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    tests = relationship("Test", back_populates="course")
