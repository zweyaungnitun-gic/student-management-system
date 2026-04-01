from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.enrollment import EnrollmentResponse
from app.schemas.test import TestResponse
from app.services.course_service import CourseService
from app.dependencies import get_current_staff
from app.models.user import Role
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.enrollment import Enrollment 
from app.models.student import Student

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseResponse])
def get_courses(
    search: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    # Tenant/course scoping
    owner_admin_id = None
    teacher_id = None
    if role_value == Role.ADMIN.value:
        owner_admin_id = current_user.id
    elif role_value == Role.TEACHER.value:
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()

    # Use service methods when possible; teacher scoping is course.teacher_id based.
    if active_only:
        courses = CourseService.get_active_courses(db, owner_admin_id=owner_admin_id)
    else:
        courses = CourseService.search_courses(db, search) if not owner_admin_id else CourseService.get_all_courses(db, owner_admin_id=owner_admin_id)

    if teacher_id is not None:
        courses = [c for c in courses if c.teacher_id == teacher_id]
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    course = CourseService.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot create courses")

    if CourseService.get_course_by_code(db, course_in.course_code):
        raise HTTPException(status_code=400, detail="Course code already exists")
    owner_admin_id = current_user.id if role_value == Role.ADMIN.value else None
    return CourseService.create_course(db, course_in, owner_admin_id=owner_admin_id)

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int, 
    course_in: CourseUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot update courses")
    course = CourseService.update_course(db, course_id, course_in)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot delete courses")
    if not CourseService.delete_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    return None

@router.get("/{course_id}/enrollments", response_model=List[EnrollmentResponse])
def get_course_enrollments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    # Use joinedload to fetch student data in the same query
    enrollments = db.query(Enrollment).options(
        joinedload(Enrollment.student),
        joinedload(Enrollment.course)
    ).filter(Enrollment.course_id == course_id).all()
    
    return enrollments

@router.get("/{course_id}/tests", response_model=List[TestResponse])
def get_course_tests(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    return CourseService.get_tests_by_course(db, course_id)

@router.get("/{course_id}/average-score")
def get_course_average_score(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    avg = CourseService.get_average_score(db, course_id)
    return {"average_score": avg}
