import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.couple import Couple
from ..models.user import User
from ..schemas.couple import CoupleOut, InviteAccept, AnniversaryUpdate
from ..schemas.user import UserOut
from ..deps import get_current_user

router = APIRouter(prefix="/couples", tags=["couples"])


def _couple_out(couple: Couple) -> CoupleOut:
    return CoupleOut(
        id=couple.id,
        user1=UserOut.model_validate(couple.user1),
        user2=UserOut.model_validate(couple.user2) if couple.user2 else None,
        status=couple.status,
        anniversary=couple.anniversary,
        invite_token=couple.invite_token if couple.status == "pending" else None,
        created_at=couple.created_at,
    )


@router.get("/me", response_model=CoupleOut)
def get_my_couple(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    couple = db.query(Couple).filter(
        ((Couple.user1_id == current_user.id) | (Couple.user2_id == current_user.id))
    ).first()
    if not couple:
        raise HTTPException(status_code=404, detail="연결된 커플이 없습니다.")
    return _couple_out(couple)


@router.post("/invite", response_model=CoupleOut, status_code=201)
def create_invite(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Couple).filter(
        (Couple.user1_id == current_user.id) | (Couple.user2_id == current_user.id)
    ).first()
    if existing:
        if existing.status == "active":
            raise HTTPException(status_code=400, detail="이미 커플이 연결되어 있습니다.")
        # Refresh token if pending
        existing.invite_token = str(uuid.uuid4())
        existing.invite_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        db.commit()
        db.refresh(existing)
        return _couple_out(existing)

    token = str(uuid.uuid4())
    couple = Couple(
        user1_id=current_user.id,
        invite_token=token,
        invite_expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        status="pending",
    )
    db.add(couple)
    db.commit()
    db.refresh(couple)
    return _couple_out(couple)


@router.post("/accept", response_model=CoupleOut)
def accept_invite(body: InviteAccept, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    already = db.query(Couple).filter(
        (Couple.user1_id == current_user.id) | (Couple.user2_id == current_user.id),
        Couple.status == "active",
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="이미 커플이 연결되어 있습니다.")

    couple = db.query(Couple).filter(Couple.invite_token == body.token).first()
    if not couple:
        raise HTTPException(status_code=404, detail="유효하지 않은 초대 코드입니다.")
    if couple.user1_id == current_user.id:
        raise HTTPException(status_code=400, detail="본인의 초대 코드는 사용할 수 없습니다.")
    if couple.invite_expires_at and couple.invite_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="만료된 초대 코드입니다.")
    if couple.status == "active":
        raise HTTPException(status_code=400, detail="이미 사용된 초대 코드입니다.")

    couple.user2_id = current_user.id
    couple.status = "active"
    couple.invite_token = None
    db.commit()
    db.refresh(couple)
    return _couple_out(couple)


@router.patch("/anniversary", response_model=CoupleOut)
def update_anniversary(
    body: AnniversaryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    couple = db.query(Couple).filter(
        ((Couple.user1_id == current_user.id) | (Couple.user2_id == current_user.id)),
        Couple.status == "active",
    ).first()
    if not couple:
        raise HTTPException(status_code=404, detail="연결된 커플이 없습니다.")
    couple.anniversary = body.anniversary
    db.commit()
    db.refresh(couple)
    return _couple_out(couple)
