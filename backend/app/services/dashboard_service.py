from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.user import User
from app.models.student_registration import StudentRegistration

class DashboardService:
    @staticmethod
    def get_dashboard_data(db: Session) -> Dict[str, Any]:
        total_students = db.query(Student).count()
        total_teachers = db.query(Teacher).count()
        total_courses = db.query(Course).count()
        total_users = db.query(User).count()
        
        pending_registrations = db.query(StudentRegistration).filter(StudentRegistration.status == "pending").count()
        
        recent_accepted = db.query(StudentRegistration).filter(
            StudentRegistration.status == "accepted"
        ).order_by(StudentRegistration.submitted_at.desc()).limit(5).all()
        
        recent_students = db.query(Student).order_by(Student.created_at.desc()).limit(5).all()
        
        active_courses = db.query(Course).filter(Course.is_active == True).limit(5).all()
        
        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "total_users": total_users,
            "pending_registrations": pending_registrations,
            "recent_accepted_registrations": recent_accepted,
            "recent_students": recent_students,
            "active_courses": active_courses
        }
