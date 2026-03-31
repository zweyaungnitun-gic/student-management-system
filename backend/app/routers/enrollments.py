from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from app.services.enrollment_service import EnrollmentService
from app.dependencies import get_current_staff
from app.models.user import Role
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.enrollment import Enrollment

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.get("/", response_model=List[EnrollmentResponse])
def get_enrollments(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    # Teacher sees enrollments only for their courses.
    if role_value == Role.TEACHER.value:
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()
        if teacher_id is None:
            return []
        q = db.query(Enrollment).join(Course, Enrollment.course_id == Course.course_id).filter(Course.teacher_id == teacher_id)
        if student_id:
            q = q.filter(Enrollment.student_id == student_id)
        if course_id:
            q = q.filter(Enrollment.course_id == course_id)
        return q.all()

    return EnrollmentService.get_all_enrollments(db, student_id, course_id)

@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
def get_enrollment(
    enrollment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    enrollment = EnrollmentService.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment_in: EnrollmentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot create enrollments")
    return EnrollmentService.create_enrollment(db, enrollment_in)

@router.patch("/{enrollment_id}/status", response_model=EnrollmentResponse)
def update_enrollment_status(
    enrollment_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot update enrollment status")
    enrollment = EnrollmentService.update_enrollment_status(db, enrollment_id, status)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot delete enrollments")
    if not EnrollmentService.delete_enrollment(db, enrollment_id):
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return None
