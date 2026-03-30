from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func

class ReportCard(Base):
    __tablename__ = "report_cards"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("common_students.id"), nullable=False)
    
    academic_year = Column(String(10))
    semester = Column(String(10))
    generated_date = Column(DateTime, default=func.now())
    
    semester_gpa = Column(Numeric(3, 2))
    cumulative_gpa = Column(Numeric(3, 2))
    
    total_credits = Column(Integer)
    total_courses = Column(Integer)
    passed_courses = Column(Integer)
    failed_courses = Column(Integer)
    
    class_rank = Column(Integer)
    total_students = Column(Integer)
    academic_standing = Column(String(20))
    
    principal_remarks = Column(String(500))
    class_teacher_remarks = Column(String(500))
    
    report_data = Column(Text)
    created_at = Column(DateTime, default=func.now())

    student = relationship("Student")
