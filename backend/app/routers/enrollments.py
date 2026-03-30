from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from app.services.enrollment_service import EnrollmentService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.get("/", response_model=List[EnrollmentResponse])
def get_enrollments(
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return EnrollmentService.get_all_enrollments(db, student_id, course_id)

@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
def get_enrollment(
    enrollment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    enrollment = EnrollmentService.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment_in: EnrollmentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return EnrollmentService.create_enrollment(db, enrollment_in)

@router.patch("/{enrollment_id}/status", response_model=EnrollmentResponse)
def update_enrollment_status(
    enrollment_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    enrollment = EnrollmentService.update_enrollment_status(db, enrollment_id, status)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not EnrollmentService.delete_enrollment(db, enrollment_id):
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return None
