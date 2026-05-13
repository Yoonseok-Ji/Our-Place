import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Couple(Base):
    __tablename__ = "couples"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user1_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    user2_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    invite_token: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    invite_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | active
    anniversary: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user1: Mapped["User"] = relationship("User", foreign_keys=[user1_id], back_populates="couples_as_user1")
    user2: Mapped["User | None"] = relationship("User", foreign_keys=[user2_id], back_populates="couples_as_user2")
    places: Mapped[list["CouplePlace"]] = relationship("CouplePlace", back_populates="couple", cascade="all, delete-orphan")
