from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("common_students.id"))
    course_id = Column(BigInteger, ForeignKey("courses.course_id"))
    semester = Column(String)
    status = Column(String, default="pending") # pending, enrolled, completed, dropped, failed
    initiated_by = Column(String) # student, admin
    enrollment_request_date = Column(DateTime, default=func.now())
    approved_at = Column(DateTime)
    completed_at = Column(DateTime)

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    test_results = relationship("TestResult", back_populates="enrollment")
