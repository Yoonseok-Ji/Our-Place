from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PlaceSaveRequest(BaseModel):
    kakao_place_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    address: Optional[str] = None
    road_address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    phone: Optional[str] = None
    place_url: Optional[str] = None


class PlaceOut(BaseModel):
    id: str
    couple_id: str
    kakao_place_id: Optional[str]
    name: str
    category: Optional[str]
    address: Optional[str]
    road_address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    phone: Optional[str]
    place_url: Optional[str]
    saved_by_male: bool
    saved_by_female: bool
    visit_count: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
