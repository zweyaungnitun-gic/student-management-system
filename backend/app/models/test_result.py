from sqlalchemy import Column, String, Float, BigInteger, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database import Base

class TestResult(Base):
    __tablename__ = "test_results"

    test_result_id = Column(BigInteger, primary_key=True, index=True)
    test_id = Column(BigInteger, ForeignKey("tests.test_id"), nullable=False)
    enrollment_id = Column(BigInteger, ForeignKey("enrollments.enrollment_id"), nullable=False)
    
    score_obtained = Column(Numeric(5, 2))
    grade = Column(String(2))
    gpa = Column(Numeric(3, 2))
    percentage = Column(Float)
    result = Column(String(10))
    teacher_feedback = Column(String(1000))
    graded_by = Column(BigInteger, ForeignKey("teachers.teacher_id"))
    
    submitted_at = Column(DateTime)
    graded_at = Column(DateTime)

    test = relationship("Test", back_populates="results")
    enrollment = relationship("Enrollment", back_populates="test_results")
    graded_by_teacher = relationship("Teacher", back_populates="test_results_graded")
