from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    department: str
    role: str
    employee_id: Optional[str] = None
    avatar: Optional[str] = None

class AvatarUpdate(BaseModel):
    avatar: Optional[str] = None
