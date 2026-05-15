from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]
from .database import engine, Base
from . import models  # noqa: ensure all models are imported before create_all
from .routers import auth, couples, places, visits

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Our Place API", version="1.0.0")

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
