from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.test import TestCreate, TestUpdate, TestResponse
from app.services.test_service import TestService
from app.dependencies import get_current_staff
from app.models.user import Role
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.test import Test

router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("/", response_model=List[TestResponse])
def get_tests(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role

    # Teacher sees tests only for their courses.
    if role_value == Role.TEACHER.value:
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()
        if teacher_id is None:
            return []
        q = db.query(Test).join(Course, Test.course_id == Course.course_id).filter(Course.teacher_id == teacher_id)
        if course_id:
            q = q.filter(Test.course_id == course_id)
        return q.all()

    # Admin/Super Admin (tenant filtering for admin will be enforced when courses are tenant-owned)
    return TestService.get_all_tests(db, course_id)

@router.get("/{test_id}", response_model=TestResponse)
def get_test(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    test = TestService.get_test_by_id(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.post("/", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
def create_test(
    test_in: TestCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        # Teacher can only create tests for their own courses.
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()
        course = db.query(Course).filter(Course.course_id == test_in.course_id).first()
        if not course or course.teacher_id != teacher_id:
            raise HTTPException(status_code=403, detail="Not allowed to create tests for this course")
    return TestService.create_test(db, test_in)

@router.put("/{test_id}", response_model=TestResponse)
def update_test(
    test_id: int, 
    test_in: TestUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    test = TestService.update_test(db, test_id, test_in)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    if not TestService.delete_test(db, test_id):
        raise HTTPException(status_code=404, detail="Test not found")
    return None
