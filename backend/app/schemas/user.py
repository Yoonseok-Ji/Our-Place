from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Literal, Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    gender: Literal["male", "female"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    gender: str
    profile_image: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
