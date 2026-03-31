from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.additional_student_info import AdditionalStudentInfo
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.dependencies import get_current_staff
from app.models.user import Role
from app.models.teacher import Teacher
from app.models.enrollment import Enrollment
from app.models.course import Course

from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=List[StudentResponse])
def get_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    query = db.query(Student)
    if role_value == Role.ADMIN.value:
        query = query.filter(Student.created_by == current_user.id)
    elif role_value == Role.TEACHER.value:
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()
        if teacher_id is None:
            return []
        query = (
            query.join(Enrollment, Enrollment.student_id == Student.id)
            .join(Course, Course.course_id == Enrollment.course_id)
            .filter(Course.teacher_id == teacher_id)
            .distinct()
        )

    return query.offset(skip).limit(limit).all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    student = StudentService.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot create students")

    # Check if national ID exists
    if db.query(Student).filter(Student.national_id == student_in.national_id).first():
        raise HTTPException(status_code=400, detail="Student with this National ID already exists")
    
    return StudentService.create_student(db, student_in, current_user.id)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int, 
    student_in: StudentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot update students")
    student = StudentService.update_student(db, student_id, student_in)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot delete students")
    if not StudentService.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    return None
