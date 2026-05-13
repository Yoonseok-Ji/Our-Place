import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, DateTime, ForeignKey, Integer, Text, Date, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..database import Base


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    couple_place_id: Mapped[str] = mapped_column(String, ForeignKey("couple_places.id"), nullable=False)
    couple_id: Mapped[str] = mapped_column(String, ForeignKey("couples.id"), nullable=False)
    visited_date: Mapped[date] = mapped_column(Date, nullable=False)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood_tags: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True, default=list)
    visit_number: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    place: Mapped["CouplePlace"] = relationship("CouplePlace", back_populates="visits")
    photos: Mapped[list["VisitPhoto"]] = relationship("VisitPhoto", back_populates="visit", cascade="all, delete-orphan")


class VisitPhoto(Base):
    __tablename__ = "visit_photos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    visit_id: Mapped[str] = mapped_column(String, ForeignKey("visits.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    uploaded_by_user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    visit: Mapped["Visit"] = relationship("Visit", back_populates="photos")
