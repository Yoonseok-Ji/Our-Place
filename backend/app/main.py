from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]
from .database import engine, Base
from . import models  # noqa: ensure all models are imported before create_all
from .routers import auth, couples, places, visits


def _migrate() -> None:
    """기존 users 테이블에 새 컬럼 추가 (idempotent)."""
    from sqlalchemy import text
    stmts = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'email'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255)",
        "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE",
    ]
    with engine.begin() as conn:
        for sql in stmts:
            conn.execute(text(sql))


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate()
    yield


app = FastAPI(title="Our Place API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(couples.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(visits.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
