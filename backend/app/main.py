from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from . import models  # noqa: ensure all models are imported before create_all
from .routers import auth, couples, places, visits

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Our Place API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(couples.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(visits.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
