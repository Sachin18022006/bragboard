from typing import Literal

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    employee_id: str | None = None
    department: str | None = "General"
    role: Literal["admin", "user"] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str
