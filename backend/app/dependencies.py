from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.core.security import decode_token
from app.models.user import Role
from app.models.teacher import Teacher

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
        
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    # Depending on SQLAlchemy enum configuration, `current_user.role` can be a `Role`
    # enum member or a raw string value. Normalize before comparing.
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value != Role.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user doesn't have enough privileges"
        )
    return current_user


def get_current_admin_or_super_admin(current_user: User = Depends(get_current_user)) -> User:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value not in (Role.ADMIN.value, Role.SUPER_ADMIN.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def get_current_super_admin(current_user: User = Depends(get_current_user)) -> User:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value != Role.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def get_current_staff(current_user: User = Depends(get_current_user)) -> User:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value not in (Role.ADMIN.value, Role.SUPER_ADMIN.value, Role.TEACHER.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def get_current_teacher(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Teacher:
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    if role_value != Role.TEACHER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found for this user")
    return teacher
