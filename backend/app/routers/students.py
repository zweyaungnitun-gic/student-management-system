from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.additional_student_info import AdditionalStudentInfo
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.dependencies import get_current_user

from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=List[StudentResponse])
def get_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return StudentService.get_all_students(db, skip, limit)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    student = StudentService.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if national ID exists
    if db.query(Student).filter(Student.national_id == student_in.national_id).first():
        raise HTTPException(status_code=400, detail="Student with this National ID already exists")
    
    return StudentService.create_student(db, student_in, current_user.id)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int, 
    student_in: StudentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    student = StudentService.update_student(db, student_id, student_in)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if not StudentService.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    return None
