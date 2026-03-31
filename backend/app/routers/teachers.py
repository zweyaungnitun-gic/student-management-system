from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse, TeacherLoginCreate, TeacherLoginResponse
from app.services.teacher_service import TeacherService
from app.dependencies import get_current_staff
from app.models.user import Role

router = APIRouter(prefix="/teachers", tags=["teachers"])

@router.get("/", response_model=List[TeacherResponse])
def get_teachers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    owner_admin_id = current_user.id if role_value == Role.ADMIN.value else None
    return TeacherService.get_all_teachers(db, search, owner_admin_id=owner_admin_id)

@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    teacher = TeacherService.get_teacher_by_id(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.post("/", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
def create_teacher(
    teacher_in: TeacherCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot create teachers")
    if TeacherService.get_teacher_by_email(db, teacher_in.email):
        raise HTTPException(status_code=400, detail="Teacher with this email already exists")
    owner_admin_id = current_user.id if role_value == Role.ADMIN.value else None
    return TeacherService.create_teacher(db, teacher_in, owner_admin_id=owner_admin_id)

@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int, 
    teacher_in: TeacherUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot update teachers")
    teacher = TeacherService.update_teacher(db, teacher_id, teacher_in)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.patch("/{teacher_id}/deactivate", response_model=TeacherResponse)
def deactivate_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot deactivate teachers")
    if not TeacherService.deactivate_teacher(db, teacher_id):
        raise HTTPException(status_code=404, detail="Teacher not found")
    return TeacherService.get_teacher_by_id(db, teacher_id)

@router.patch("/{teacher_id}/activate", response_model=TeacherResponse)
def activate_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff)
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot activate teachers")
    if not TeacherService.activate_teacher(db, teacher_id):
        raise HTTPException(status_code=404, detail="Teacher not found")
    return TeacherService.get_teacher_by_id(db, teacher_id)


@router.post("/{teacher_id}/login", response_model=TeacherLoginResponse, status_code=status.HTTP_201_CREATED)
def create_teacher_login(
    teacher_id: int,
    login_in: TeacherLoginCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_staff),
):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value == Role.TEACHER.value:
        raise HTTPException(status_code=403, detail="Teachers cannot create teacher logins")

    try:
        user = TeacherService.create_teacher_login(db, teacher_id, login_in.username, login_in.password)
        if not user:
            raise HTTPException(status_code=404, detail="Teacher not found")
        return {"user_id": user.id, "username": user.username, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
