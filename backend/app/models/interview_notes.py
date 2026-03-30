from sqlalchemy import Column, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class InterviewNotes(Base):
    __tablename__ = "interview_notes"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("common_students.id"))
    
    interview_1 = Column("interview_1", String(2000))
    interview_2 = Column("interview_2", String(2000))
    interview_3 = Column("interview_3", String(2000))
    other_memo = Column(String(4000))

    student = relationship("Student", back_populates="interview_notes")
