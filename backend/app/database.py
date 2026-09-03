import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

db_url = settings.DATABASE_URL
engine_kwargs = {
    "echo": settings.ENVIRONMENT == "development",
    "future": True,
}

if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

# Create Async SQLAlchemy Engine with fallback to SQLite if PostgreSQL isn't configured
try:
    engine = create_async_engine(db_url, **engine_kwargs)
except Exception:
    fallback_url = "sqlite+aiosqlite:///./kisan_suvidha_dev.db"
    engine = create_async_engine(fallback_url, connect_args={"check_same_thread": False})

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base ORM model class for all Kisan Suvidha database entities."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency generator yielding async database sessions for FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Async context manager yielding sessions for Celery tasks & background services."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
