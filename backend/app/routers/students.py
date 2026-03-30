from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=List[StudentResponse])
def get_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    students = db.query(Student).offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
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
        
    db_student = Student(**student_in.model_dump(), created_by=current_user.id)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int, 
    student_in: StudentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    update_data = student_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
        
    db.commit()
    db.refresh(db_student)
    return db_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db.delete(db_student)
    db.commit()
    return None
