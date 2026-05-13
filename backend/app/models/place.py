import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class CouplePlace(Base):
    __tablename__ = "couple_places"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    couple_id: Mapped[str] = mapped_column(String, ForeignKey("couples.id"), nullable=False)
    kakao_place_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    road_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    lat: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    lng: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    place_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    saved_by_male: Mapped[bool] = mapped_column(Boolean, default=False)
    saved_by_female: Mapped[bool] = mapped_column(Boolean, default=False)
    visit_count: Mapped[int] = mapped_column(Integer, default=0)
    # MALE_ONLY | FEMALE_ONLY | BOTH | VISITED
    status: Mapped[str] = mapped_column(String(20), default="MALE_ONLY")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    couple: Mapped["Couple"] = relationship("Couple", back_populates="places")
    visits: Mapped[list["Visit"]] = relationship("Visit", back_populates="place", cascade="all, delete-orphan")
