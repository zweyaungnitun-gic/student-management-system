from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class Test(Base):
    __tablename__ = "tests"

    test_id = Column(BigInteger, primary_key=True, index=True)
    course_id = Column(BigInteger, ForeignKey("courses.course_id"), nullable=False)
    test_name = Column(String, nullable=False)
    description = Column(String(500))
    total_marks = Column(Integer, nullable=False)
    passing_marks = Column(Integer)
    test_date = Column(DateTime)
    duration_minutes = Column(Integer)
    created_by = Column(BigInteger, ForeignKey("teachers.teacher_id"))
    created_at = Column(DateTime, default=func.now(), nullable=False)

    course = relationship("Course", back_populates="tests")
    created_by_teacher = relationship("Teacher", back_populates="tests_created")
    results = relationship("TestResult", back_populates="test")
