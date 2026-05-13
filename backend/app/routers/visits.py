import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..models.place import CouplePlace
from ..models.visit import Visit, VisitPhoto
from ..models.couple import Couple
from ..models.user import User
from ..schemas.visit import VisitCreate, VisitOut, PlaceWithVisits, VisitUpdate
from ..deps import get_current_user, get_active_couple

router = APIRouter(prefix="/visits", tags=["visits"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _update_place_status(place: CouplePlace):
    place.visit_count = len([v for v in place.visits])
    if place.visit_count > 0:
        place.status = "VISITED"
    elif place.saved_by_male and place.saved_by_female:
        place.status = "BOTH"
    elif place.saved_by_male:
        place.status = "MALE_ONLY"
    else:
        place.status = "FEMALE_ONLY"


@router.get("/timeline", response_model=list[PlaceWithVisits])
def get_timeline(
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    visited_places = db.query(CouplePlace).filter(
        CouplePlace.couple_id == couple.id,
        CouplePlace.visit_count > 0,
    ).order_by(CouplePlace.updated_at.desc()).all()
    return visited_places


@router.post("/{place_id}", response_model=VisitOut, status_code=201)
def log_visit(
    place_id: str,
    body: VisitCreate,
    current_user: User = Depends(get_current_user),
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    place = db.query(CouplePlace).filter(
        CouplePlace.id == place_id,
        CouplePlace.couple_id == couple.id,
    ).first()
    if not place:
        raise HTTPException(status_code=404, detail="장소를 찾을 수 없습니다.")

    visit_number = place.visit_count + 1
    visit = Visit(
        couple_place_id=place.id,
        couple_id=couple.id,
        visited_date=body.visited_date,
        rating=body.rating,
        memo=body.memo,
        mood_tags=body.mood_tags or [],
        visit_number=visit_number,
    )
    db.add(visit)
    place.visit_count = visit_number
    place.status = "VISITED"
    if current_user.gender == "male":
        place.saved_by_male = True
    else:
        place.saved_by_female = True
    db.commit()
    db.refresh(visit)
    return visit


@router.post("/{place_id}/{visit_id}/photos", status_code=201)
async def upload_photo(
    place_id: str,
    visit_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.couple_id == couple.id,
    ).first()
    if not visit:
        raise HTTPException(status_code=404, detail="방문 기록을 찾을 수 없습니다.")

    ext = os.path.splitext(file.filename or "photo.jpg")[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    photo = VisitPhoto(
        visit_id=visit_id,
        image_url=f"/uploads/{filename}",
        uploaded_by_user_id=current_user.id,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"id": photo.id, "image_url": photo.image_url}


@router.patch("/{place_id}/{visit_id}", response_model=VisitOut)
def update_visit(
    place_id: str,
    visit_id: str,
    body: VisitUpdate,
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.couple_id == couple.id,
    ).first()
    if not visit:
        raise HTTPException(status_code=404, detail="방문 기록을 찾을 수 없습니다.")

    for field in body.model_fields_set:
        setattr(visit, field, getattr(body, field))

    db.commit()
    db.refresh(visit)
    return visit


@router.delete("/{place_id}/{visit_id}", status_code=204)
def delete_visit(
    place_id: str,
    visit_id: str,
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    visit = db.query(Visit).filter(
        Visit.id == visit_id,
        Visit.couple_id == couple.id,
    ).first()
    if not visit:
        raise HTTPException(status_code=404, detail="방문 기록을 찾을 수 없습니다.")

    place = db.query(CouplePlace).filter(CouplePlace.id == place_id).first()
    db.delete(visit)
    db.flush()
    if place:
        _update_place_status(place)
    db.commit()


@router.get("/{place_id}", response_model=PlaceWithVisits)
def get_place_visits(
    place_id: str,
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    place = db.query(CouplePlace).filter(
        CouplePlace.id == place_id,
        CouplePlace.couple_id == couple.id,
    ).first()
    if not place:
        raise HTTPException(status_code=404, detail="장소를 찾을 수 없습니다.")
    return place
