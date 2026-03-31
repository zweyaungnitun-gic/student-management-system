from sqlalchemy import Column, Integer, String, Enum as SQLEnum, DateTime, BigInteger, Boolean
from app.database import Base
from sqlalchemy.sql import func
import enum

class Role(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    GUEST = "GUEST"

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(String, unique=True, nullable=False)
    username = Column("name", String(25), nullable=False)
    email = Column(String(25), unique=True, nullable=False)
    password = Column(String)
    role = Column(SQLEnum(Role, name="role_enum"), nullable=False, default=Role.GUEST)
    school_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
