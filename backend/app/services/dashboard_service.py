from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.user import User
from app.models.student_registration import StudentRegistration
from app.models.user import Role

class DashboardService:
    @staticmethod
    def get_dashboard_data(db: Session, current_user: User) -> Dict[str, Any]:
        role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

        students_q = db.query(Student)
        teachers_q = db.query(Teacher)
        courses_q = db.query(Course)
        users_q = db.query(User)

        # Tenant scoping: ADMIN sees only their tenant-owned data.
        if role_value == Role.ADMIN.value:
            students_q = students_q.filter(Student.created_by == current_user.id)
            teachers_q = teachers_q.filter(Teacher.owner_admin_id == current_user.id)
            courses_q = courses_q.filter(Course.owner_admin_id == current_user.id)
            users_q = users_q.filter(User.id == current_user.id)
        # SUPER_ADMIN sees all tenants.

        total_students = students_q.count()
        total_teachers = teachers_q.count()
        total_courses = courses_q.count()
        total_users = users_q.count()
        
        pending_registrations = db.query(StudentRegistration).filter(StudentRegistration.registration_status == "PENDING").count()
        
        recent_accepted = db.query(StudentRegistration).filter(
            StudentRegistration.registration_status == "ACCEPTED"
        ).order_by(StudentRegistration.submitted_at.desc()).limit(5).all()
        
        recent_students = students_q.order_by(Student.created_at.desc()).limit(5).all()
        
        active_courses = courses_q.filter(Course.is_active == True).limit(5).all()

        # FastAPI can serialize basic python types, but not SQLAlchemy model instances directly.
        # Convert ORM rows into plain dicts/strings for a stable JSON response.
        recent_accepted_payload = [
            {
                "id": r.id,
                "registration_code": r.registration_code,
                "registration_status": getattr(r.registration_status, "value", r.registration_status),
                "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
                "decided_at": r.decided_at.isoformat() if r.decided_at else None,
                "decided_by": r.decided_by,
                "accepted_student_id": r.accepted_student_id,
                "english_name": r.english_name,
                "katakana_name": r.katakana_name,
                "national_id_number": r.national_id_number,
            }
            for r in recent_accepted
        ]

        recent_students_payload = [
            {
                "id": s.id,
                "student_id": s.student_id,
                "student_name": s.student_name,
                "registration_status": getattr(s.registration_status, "value", s.registration_status),
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in recent_students
        ]

        active_courses_payload = [
            {
                "course_id": c.course_id,
                "course_code": c.course_code,
                "course_name": c.course_name,
                "description": c.description,
                "credit_hours": c.credit_hours,
                "teacher_id": c.teacher_id,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in active_courses
        ]
        
        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "total_users": total_users,
            "pending_registrations": pending_registrations,
            "recent_accepted_registrations": recent_accepted_payload,
            "recent_students": recent_students_payload,
            "active_courses": active_courses_payload
        }
