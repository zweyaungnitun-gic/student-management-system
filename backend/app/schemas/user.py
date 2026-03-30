from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Role

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Role = Role.GUEST
    school_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
