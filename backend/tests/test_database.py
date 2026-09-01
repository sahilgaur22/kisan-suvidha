import pytest
from app.database import engine, Base, get_db, get_db_session


def test_database_engine_config():
    assert engine is not None
    assert engine.url is not None


@pytest.mark.asyncio
async def test_database_session_generator():
    async for session in get_db():
        assert session is not None
        await session.close()
        break


@pytest.mark.asyncio
async def test_database_context_manager():
    async with get_db_session() as session:
        assert session is not None
