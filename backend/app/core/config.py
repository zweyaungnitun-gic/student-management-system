from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    app_name: str = "Student Management System API"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:5173"
    
    # Database
    db_url: str = ""
    db_username: str = ""
    db_password: str = ""
    database_url: str = ""
    
    @property
    def get_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        if self.db_url:
            import urllib.parse
            base_url = self.db_url.replace("jdbc:", "")
            if "://" in base_url and self.db_username and self.db_password:
                pwd = urllib.parse.quote_plus(self.db_password)
                user = urllib.parse.quote_plus(self.db_username)
                parts = base_url.split("://", 1)
                return f"{parts[0]}://{user}:{pwd}@{parts[1]}"
            return base_url
        return ""
    
    # Security
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
