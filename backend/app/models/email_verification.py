from datetime import datetime
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    email: Mapped[str] = mapped_column(String(255), primary_key=True)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
