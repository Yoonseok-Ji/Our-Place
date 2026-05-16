from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://ourplace:ourplace_secret@db:5432/ourplace_db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # AWS
    AWS_REGION: str = "ap-northeast-2"
    S3_BUCKET_NAME: str

    # AWS SES (이메일 발송)
    SES_SENDER_EMAIL: str = ""       # SES에서 인증된 발신 이메일
    EMAIL_FROM_NAME: str = "우리들의 지도"

    # 소셜 OAuth (백엔드 시크릿)
    KAKAO_CLIENT_ID: str = ""
    KAKAO_CLIENT_SECRET: str = ""
    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # 프론트엔드 URL (OAuth redirect_uri 검증용)
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
