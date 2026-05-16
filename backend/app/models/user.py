import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum as SAEnum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    gender: Mapped[str] = mapped_column(SAEnum("male", "female", name="gender_enum"), nullable=False)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # 소셜로그인
    provider: Mapped[str] = mapped_column(String(20), nullable=False, default="email")
    oauth_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)

    # 이메일 인증
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    couples_as_user1: Mapped[list["Couple"]] = relationship("Couple", foreign_keys="Couple.user1_id", back_populates="user1")
    couples_as_user2: Mapped[list["Couple"]] = relationship("Couple", foreign_keys="Couple.user2_id", back_populates="user2")
