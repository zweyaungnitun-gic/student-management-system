from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.services.teacher_service import TeacherService
from app.dependencies import get_current_active_admin

router = APIRouter(prefix="/teachers", tags=["teachers"])

@router.get("/", response_model=List[TeacherResponse])
def get_teachers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    return TeacherService.get_all_teachers(db, search)

@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    teacher = TeacherService.get_teacher_by_id(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.post("/", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(
    teacher_in: TeacherCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if TeacherService.get_teacher_by_email(db, teacher_in.email):
        raise HTTPException(status_code=400, detail="Teacher with this email already exists")
    return TeacherService.create_teacher(db, teacher_in)

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int, 
    teacher_in: TeacherUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    teacher = TeacherService.update_teacher(db, teacher_id, teacher_in)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.patch("/{teacher_id}/deactivate", response_model=TeacherResponse)
def deactivate_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not TeacherService.deactivate_teacher(db, teacher_id):
        raise HTTPException(status_code=404, detail="Teacher not found")
    return TeacherService.get_teacher_by_id(db, teacher_id)

@router.patch("/{teacher_id}/activate", response_model=TeacherResponse)
def activate_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    if not TeacherService.activate_teacher(db, teacher_id):
        raise HTTPException(status_code=404, detail="Teacher not found")
    return TeacherService.get_teacher_by_id(db, teacher_id)
