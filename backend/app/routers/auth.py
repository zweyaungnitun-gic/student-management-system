from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()
    
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    
    # In a real app we might set this in httpOnly cookies, but for now returning it
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    role_value = current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    return {
        "id": current_user.id,
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "role": role_value,
        "school_name": current_user.school_name,
        "created_at": current_user.created_at.isoformat() if getattr(current_user, "created_at", None) else None,
    }
