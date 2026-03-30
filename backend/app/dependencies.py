from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Bypass authentication - always return a mock admin user"""
    # Return a mock admin user instead of validating token
    mock_user = User(
        id=1,
        user_id="ADMIN001",
        username="Admin",
        email="admin@example.com",
        role=Role.ADMIN,
        school_name="GIC System"
    )
    return mock_user

def get_current_active_admin(current_user: User = Depends(get_current_user)):
    """Always return current user (which is admin)"""
    return current_user