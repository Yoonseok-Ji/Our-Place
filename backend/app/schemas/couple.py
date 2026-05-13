from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from .user import UserOut


class CoupleOut(BaseModel):
    id: str
    user1: UserOut
    user2: Optional[UserOut]
    status: str
    anniversary: Optional[date]
    invite_token: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class InviteAccept(BaseModel):
    token: str


class AnniversaryUpdate(BaseModel):
    anniversary: date
