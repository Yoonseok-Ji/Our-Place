from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class VisitCreate(BaseModel):
    visited_date: date
    rating: Optional[int] = None
    memo: Optional[str] = None
    mood_tags: Optional[list[str]] = None


class PhotoOut(BaseModel):
    id: str
    visit_id: str
    image_url: str
    uploaded_by_user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class VisitOut(BaseModel):
    id: str
    couple_place_id: str
    couple_id: str
    visited_date: date
    rating: Optional[int]
    memo: Optional[str]
    mood_tags: Optional[list[str]]
    visit_number: int
    photos: list[PhotoOut]
    created_at: datetime

    model_config = {"from_attributes": True}


class PlaceWithVisits(BaseModel):
    id: str
    name: str
    category: Optional[str]
    address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    saved_by_male: bool
    saved_by_female: bool
    visit_count: int
    status: str
    visits: list[VisitOut]

    model_config = {"from_attributes": True}
