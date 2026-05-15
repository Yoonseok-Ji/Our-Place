from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://ourplace:ourplace_secret@db:5432/ourplace_db"
    SECRET_KEY: str  # 기본값 없음 — .env 필수
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    AWS_REGION: str = "ap-northeast-2"
    S3_BUCKET_NAME: str  # 기본값 없음 — .env 필수

    class Config:
        env_file = ".env"


settings = Settings()
