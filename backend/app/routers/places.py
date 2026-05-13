from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.place import CouplePlace
from ..models.couple import Couple
from ..models.user import User
from ..schemas.place import PlaceSaveRequest, PlaceOut
from ..deps import get_current_user, get_active_couple

router = APIRouter(prefix="/places", tags=["places"])


def _compute_status(saved_by_male: bool, saved_by_female: bool, visit_count: int) -> str:
    if visit_count > 0:
        return "VISITED"
    if saved_by_male and saved_by_female:
        return "BOTH"
    if saved_by_male:
        return "MALE_ONLY"
    return "FEMALE_ONLY"


@router.get("/", response_model=list[PlaceOut])
def list_places(
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    return db.query(CouplePlace).filter(CouplePlace.couple_id == couple.id).all()


@router.post("/", response_model=PlaceOut, status_code=201)
def save_place(
    body: PlaceSaveRequest,
    current_user: User = Depends(get_current_user),
    couple: Couple = Depends(get_active_couple),
    db: Session = Depends(get_db),
):
    is_male = current_user.gender == "male"

    # 이미 저장된 장소인지 확인 (kakao_place_id 또는 name+lat+lng 기준)
    existing = None
    if body.kakao_place_id:
        existing = db.query(CouplePlace).filter(
            CouplePlace.couple_id == couple.id,
            CouplePlace.kakao_place_id == body.kakao_place_id,
        ).first()

    if existing:
        if is_male:
            existing.saved_by_male = True
        else:
            existing.saved_by_female = True
        existing.status = _compute_status(existing.saved_by_male, existing.saved_by_female, existing.visit_count)
        db.commit()
        db.refresh(existing)
        return existing

    place = CouplePlace(
        couple_id=couple.id,
        kakao_place_id=body.kakao_place_id,
        name=body.name,
        category=body.category,
        address=body.address,
        road_address=body.road_address,
        lat=body.lat,
        lng=body.lng,
        phone=body.phone,
        place_url=body.place_url,
        saved_by_male=is_male,
        saved_by_female=not is_male,
        visit_count=0,
        status="MALE_ONLY" if is_male else "FEMALE_ONLY",
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.get("/{place_id}", response_model=PlaceOut)
def get_place(
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


@router.delete("/{place_id}", status_code=204)
def delete_place(
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
    db.delete(place)
    db.commit()
