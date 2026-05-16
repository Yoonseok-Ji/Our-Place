import random
import string
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.email_verification import EmailVerification
from ..schemas.user import UserCreate, UserLogin, UserOut, TokenOut
from ..core.security import hash_password, verify_password, create_access_token
from ..core.email import send_verification_email
from ..core.oauth import get_kakao_user, get_naver_user, get_google_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

CODE_TTL_MINUTES = 5


@router.get("/features")
def auth_features():
    """프론트엔드가 기능 활성화 여부를 판단하기 위한 엔드포인트"""
    return {
        "email_verification": bool(settings.SES_SENDER_EMAIL),
    }


# ─── 헬퍼 ────────────────────────────────────────────────────────────────────

def _make_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _token_for(user: User) -> TokenOut:
    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


def _find_or_create_social_user(
    db: Session,
    provider: str,
    oauth_id: str,
    email: str,
    name: str,
) -> User:
    # 같은 provider + oauth_id → 기존 유저 로그인
    user = db.query(User).filter(User.provider == provider, User.oauth_id == oauth_id).first()
    if user:
        return user

    # 같은 이메일로 다른 방식으로 가입된 계정이 있으면 에러
    if email:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"이미 '{existing.provider}' 방식으로 가입된 이메일입니다. 해당 방법으로 로그인해주세요.",
            )

    # 소셜 전용 새 계정 생성 (성별 정보 없음 → 이후 프로필 설정)
    user = User(
        id=str(uuid.uuid4()),
        email=email or f"{provider}_{oauth_id}@noemail.local",
        password_hash=None,
        name=name or "사용자",
        gender="male",          # 소셜 가입 후 프로필 페이지에서 수정 가능
        provider=provider,
        oauth_id=oauth_id,
        email_verified=True,    # 소셜 제공자가 이미 검증
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ─── 이메일/비밀번호 인증 ─────────────────────────────────────────────────────

@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    email_verified = False
    ev = None

    if settings.SES_SENDER_EMAIL:
        # SES 설정된 경우: 인증 필수
        ev = db.query(EmailVerification).filter(EmailVerification.email == body.email).first()
        if not ev or not ev.verified:
            raise HTTPException(status_code=400, detail="이메일 인증을 먼저 완료해주세요.")
        email_verified = True

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        gender=body.gender,
        provider="email",
        email_verified=email_verified,
    )
    db.add(user)
    if ev:
        db.delete(ev)
    db.commit()
    db.refresh(user)
    return _token_for(user)


@router.post("/login", response_model=TokenOut)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    return _token_for(user)


# ─── 이메일 인증 코드 ──────────────────────────────────────────────────────────

class SendCodeRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


@router.post("/send-code", status_code=200)
def send_code(body: SendCodeRequest, db: Session = Depends(get_db)):
    """회원가입용 이메일 인증 코드 발송"""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    code = _make_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=CODE_TTL_MINUTES)

    ev = db.query(EmailVerification).filter(EmailVerification.email == body.email).first()
    if ev:
        ev.code = code
        ev.expires_at = expires
        ev.verified = False
    else:
        db.add(EmailVerification(email=body.email, code=code, expires_at=expires))

    db.commit()

    try:
        send_verification_email(body.email, code)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "인증 코드가 발송됐어요"}


@router.post("/verify-code", status_code=200)
def verify_code(body: VerifyCodeRequest, db: Session = Depends(get_db)):
    """인증 코드 확인"""
    ev = db.query(EmailVerification).filter(EmailVerification.email == body.email).first()
    now = datetime.now(timezone.utc)

    if not ev or ev.code != body.code.strip():
        raise HTTPException(status_code=400, detail="인증 코드가 올바르지 않아요")
    if ev.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(status_code=400, detail="인증 코드가 만료됐어요. 다시 요청해주세요")

    ev.verified = True
    db.commit()
    return {"message": "인증됐어요"}


# ─── 소셜 로그인 ──────────────────────────────────────────────────────────────

class SocialLoginRequest(BaseModel):
    code: str
    redirect_uri: str
    state: str | None = None    # 네이버 CSRF state


@router.post("/kakao", response_model=TokenOut)
def kakao_login(body: SocialLoginRequest, db: Session = Depends(get_db)):
    try:
        info = get_kakao_user(body.code, body.redirect_uri)
    except Exception:
        raise HTTPException(status_code=400, detail="카카오 인증에 실패했어요")
    user = _find_or_create_social_user(db, "kakao", info["oauth_id"], info["email"], info["name"])
    return _token_for(user)


@router.post("/naver", response_model=TokenOut)
def naver_login(body: SocialLoginRequest, db: Session = Depends(get_db)):
    try:
        info = get_naver_user(body.code, body.state or "", body.redirect_uri)
    except Exception:
        raise HTTPException(status_code=400, detail="네이버 인증에 실패했어요")
    user = _find_or_create_social_user(db, "naver", info["oauth_id"], info["email"], info["name"])
    return _token_for(user)


@router.post("/google", response_model=TokenOut)
def google_login(body: SocialLoginRequest, db: Session = Depends(get_db)):
    try:
        info = get_google_user(body.code, body.redirect_uri)
    except Exception:
        raise HTTPException(status_code=400, detail="구글 인증에 실패했어요")
    user = _find_or_create_social_user(db, "google", info["oauth_id"], info["email"], info["name"])
    return _token_for(user)
