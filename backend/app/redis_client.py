from typing import AsyncGenerator
import redis.asyncio as aioredis
from app.config import settings

# Async Redis Connection Pool
redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    max_connections=20,
)


def get_redis() -> aioredis.Redis:
    """Returns an async Redis client instance from connection pool."""
    return aioredis.Redis(connection_pool=redis_pool)


async def get_redis_client() -> AsyncGenerator[aioredis.Redis, None]:
    """Dependency generator yielding async Redis clients for FastAPI routes."""
    client = get_redis()
    try:
        yield client
    finally:
        await client.close()


async def ping_redis() -> bool:
    """Check Redis health connection status."""
    try:
        client = get_redis()
        res = await client.ping()
        await client.close()
        return res is True
    except Exception:
        return False
