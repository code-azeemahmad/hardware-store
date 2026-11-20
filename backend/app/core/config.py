from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg://hardware_user:hardware_secure_dev_pass_2026@hardware-postgres:5432/hardware_db"
    )

    # Security
    SECRET_KEY: str = "dev_secret_hardware_store_key_change_in_production_min32chars!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    INVITATION_TOKEN_EXPIRE_HOURS: int = 72

    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost",
        "http://127.0.0.1",
        "https://naseerhardware.duckdns.org",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    @model_validator(mode="after")
    def validate_security_settings(self) -> "Settings":
        if self.APP_ENV.lower() == "production":
            dev_secret = "dev_secret_hardware_store_key_change_in_production_min32chars!"
            if self.SECRET_KEY == dev_secret:
                raise ValueError("Insecure SECRET_KEY: The development secret key cannot be used in production.")
            if len(self.SECRET_KEY) < 32:
                raise ValueError("Insecure SECRET_KEY: Production secret key must be at least 32 characters long.")
            if self.DEBUG:
                raise ValueError("Insecure configuration: DEBUG must be set to False in production.")
        return self

    # Media Storage
    MEDIA_STORAGE_PATH: str = "/data/media"

    # Public URLs
    PUBLIC_SITE_URL: str = "http://localhost"
    PUBLIC_API_URL: str = "http://localhost/api/v1"

    # Store Defaults
    STORE_NAME_EN: str = "Naseer Plywood & Hardware"
    STORE_NAME_UR: str = "نصیر پلائی ووڈ اینڈ ہارڈویئر"
    STORE_PHONE: str = "0304-5030046 / 0317-7030847"
    STORE_WHATSAPP: str = "923177030847"
    STORE_ADDRESS_EN: str = "Near New Cantt Hospital, Canal Road / General Bus Stand Road, Sargodha, Pakistan"
    STORE_ADDRESS_UR: str = "نزد نیو کینٹ ہسپتال کینال روڈ / جنرل بس اسٹینڈ روڈ، سرگودھا، پاکستان"
    STORE_MAPS_URL: str = "https://maps.app.goo.gl/ebSodsY4LkVm8H9d9"


settings = Settings()
