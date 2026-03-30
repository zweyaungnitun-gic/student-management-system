from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Role

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "GUEST"
    school_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    school_name: Optional[str] = None

class UserResponse(UserBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
