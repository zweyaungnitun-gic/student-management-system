from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.enrollment import EnrollmentResponse
from app.schemas.test import TestResponse
from app.services.course_service import CourseService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseResponse])
def get_courses(
    search: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if active_only:
        return CourseService.get_active_courses(db)
    return CourseService.search_courses(db, search)

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    course = CourseService.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if CourseService.get_course_by_code(db, course_in.course_code):
        raise HTTPException(status_code=400, detail="Course code already exists")
    return CourseService.create_course(db, course_in)

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int, 
    course_in: CourseUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    course = CourseService.update_course(db, course_id, course_in)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not CourseService.delete_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    return None

@router.get("/{course_id}/enrollments", response_model=List[EnrollmentResponse])
def get_course_enrollments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return CourseService.get_enrollments_by_course(db, course_id)

@router.get("/{course_id}/tests", response_model=List[TestResponse])
def get_course_tests(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return CourseService.get_tests_by_course(db, course_id)

@router.get("/{course_id}/average-score")
def get_course_average_score(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    avg = CourseService.get_average_score(db, course_id)
    return {"average_score": avg}
