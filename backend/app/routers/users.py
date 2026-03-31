from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService
from app.dependencies import get_current_super_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
def get_users(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_super_admin)
):
    return UserService.get_all_users(db, search)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_super_admin)
):
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_super_admin)
):
    if UserService.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if UserService.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    return UserService.create_user(db, user_in)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    user_in: UserUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_super_admin)
):
    user = UserService.update_user(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_super_admin)
):
    if not UserService.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return None
