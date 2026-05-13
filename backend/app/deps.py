from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .core.security import decode_token
from .models.user import User
from .models.couple import Couple

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰입니다.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자를 찾을 수 없습니다.")
    return user


def get_active_couple(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Couple:
    couple = db.query(Couple).filter(
        ((Couple.user1_id == current_user.id) | (Couple.user2_id == current_user.id)),
        Couple.status == "active",
    ).first()
    if not couple:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="연결된 커플이 없습니다.")
    return couple
