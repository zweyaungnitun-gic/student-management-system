from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.test_result import TestResultCreate, TestResultUpdate, TestResultResponse
from app.services.test_result_service import TestResultService
from app.dependencies import get_current_staff
from sqlalchemy.orm import joinedload

from app.models.test_result import TestResult
from app.models.test import Test
from app.models.enrollment import Enrollment
from app.models.student import Student
from app.models.course import Course
from app.models.teacher import Teacher
from app.models.user import Role

router = APIRouter(prefix="/results", tags=["results"])

@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
def get_all_results(
    testId: Optional[int] = Query(None, alias="testId"),
    studentName: Optional[str] = Query(None, alias="studentName"),
    courseId: Optional[int] = Query(None, alias="courseId"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff),
):
    """
    Frontend calls `GET /api/results` from `resultService.getAll()`.

    The existing API only implemented per-test / per-student lookups, so
    we provide a list endpoint here that matches what `ResultList.jsx` expects.
    """
    query = (
        db.query(TestResult)
        .options(
            joinedload(TestResult.test),
            joinedload(TestResult.enrollment).joinedload(Enrollment.student),
            joinedload(TestResult.enrollment).joinedload(Enrollment.course),
        )
    )

    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.ADMIN.value:
        # Restrict to tenant-owned courses (via Course.owner_admin_id).
        query = (
            query.join(Enrollment, TestResult.enrollment_id == Enrollment.enrollment_id)
            .join(Course, Enrollment.course_id == Course.course_id)
            .filter(Course.owner_admin_id == current_user.id)
            .distinct()
        )
    elif role_value == Role.TEACHER.value:
        # Restrict to the teacher's courses.
        teacher_id = db.query(Teacher.teacher_id).filter(Teacher.user_id == current_user.id).scalar()
        if teacher_id is None:
            return []
        query = (
            query.join(Enrollment, TestResult.enrollment_id == Enrollment.enrollment_id)
            .join(Course, Enrollment.course_id == Course.course_id)
            .filter(Course.teacher_id == teacher_id)
            .distinct()
        )

    if testId is not None:
        query = query.filter(TestResult.test_id == testId)

    if courseId is not None:
        # Filter through enrollment relationship.
        query = (
            query.join(Enrollment, TestResult.enrollment_id == Enrollment.enrollment_id)
            .filter(Enrollment.course_id == courseId)
            .distinct()
        )

    if studentName:
        # Filter by student name through enrollment relationship.
        query = (
            query.join(Enrollment, TestResult.enrollment_id == Enrollment.enrollment_id)
            .join(Student, Enrollment.student_id == Student.id)
            .filter(Student.student_name.ilike(f"%{studentName}%"))
            .distinct()
        )

    results = query.order_by(TestResult.test_result_id.desc()).all()

    payload = []
    for r in results:
        test = getattr(r, "test", None)
        enrollment = getattr(r, "enrollment", None)
        student = getattr(enrollment, "student", None) if enrollment else None
        course = getattr(enrollment, "course", None) if enrollment else None

        payload.append(
            {
                "test_result_id": getattr(r, "test_result_id", None),
                "test_id": getattr(r, "test_id", None),
                "student_id": getattr(enrollment, "student_id", None) if enrollment else None,
                "test_name": getattr(test, "test_name", None),
                "student_name": getattr(student, "student_name", None),
                "course_name": getattr(course, "course_name", None) if course else getattr(test.course, "course_name", None) if test else None,
                "score_obtained": float(getattr(r, "score_obtained", 0)) if getattr(r, "score_obtained", None) is not None else None,
                "total_marks": getattr(test, "total_marks", None),
                "percentage": float(getattr(r, "percentage", 0)) if getattr(r, "percentage", None) is not None else None,
                "grade": getattr(r, "grade", None),
                "gpa": float(getattr(r, "gpa", 0)) if getattr(r, "gpa", None) is not None else None,
                "result": getattr(r, "result", None),
            }
        )

    return payload

@router.get("/test/{test_id}", response_model=List[TestResultResponse])
def get_results_by_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    return TestResultService.get_results_by_test(db, test_id)

@router.get("/student/{student_id}", response_model=List[TestResultResponse])
def get_results_by_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    return TestResultService.get_results_by_student(db, student_id)

@router.get("/{result_id}", response_model=TestResultResponse)
def get_result(
    result_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    result = TestResultService.get_result_by_id(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Test Result not found")
    return result

@router.post("/", response_model=TestResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(
    result_in: TestResultCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    return TestResultService.create_result(db, result_in)

@router.put("/{result_id}", response_model=TestResultResponse)
def update_result(
    result_id: int, 
    result_in: TestResultUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    result = TestResultService.update_result(db, result_id, result_in)
    if not result:
        raise HTTPException(status_code=404, detail="Test Result not found")
    return result

@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(
    result_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    if not TestResultService.delete_result(db, result_id):
        raise HTTPException(status_code=404, detail="Test Result not found")
    return None
