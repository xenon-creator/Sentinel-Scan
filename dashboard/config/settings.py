import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = 'Sentinel-Scan Dashboard API'
    APP_VERSION: str = '1.0.0'
    API_V1_PREFIX: str = '/api'
    MONGODB_URL: str = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    MONGODB_DB_NAME: str = os.getenv('MONGODB_DB_NAME', 'sentinel_scan')
    CORS_ORIGINS: list[str] = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174']

    class Config:
        env_file = '.env'
        extra = 'ignore'
settings = Settings()