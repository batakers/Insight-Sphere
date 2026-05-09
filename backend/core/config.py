from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- Core ----
    # Menyediakan default value untuk kemudahan development lokal jika .env tak ada
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5433/pos_cerdas_db"
    SECRET_KEY: str = "supersecretkey123"
    # 7 hari — cukup panjang untuk POS offline mode tanpa auto-logout.
    # Trade-off: kalau device hilang/dicuri, attacker punya token valid s.d. 7 hari.
    # Mitigasi: token blacklist / revocation bisa ditambah kemudian.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REDIS_URL: str = "redis://localhost:6379/0"

    # ---- App ----
    APP_NAME: str = "InsightSphere"
    FRONTEND_URL: str = "http://localhost:3000"

    # ---- Email (SMTP) ----
    # Jika SMTP_HOST kosong → service jalan di MODE CONSOLE (log ke stdout, dev-friendly).
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None     # Default ke SMTP_USER kalau kosong
    SMTP_FROM_NAME: Optional[str] = None      # Default ke APP_NAME
    SMTP_USE_TLS: bool = True

    # ---- Token expiry ----
    INVITE_TOKEN_EXPIRE_HOURS: int = 24 * 7   # 7 hari
    RESET_TOKEN_EXPIRE_HOURS: int = 1         # 1 jam (security best practice)

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
