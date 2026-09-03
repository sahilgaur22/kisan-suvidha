import json
from typing import Optional, Dict, Any
import redis.asyncio as aioredis

# Fallback in-memory session cache for local dev/testing when Redis server is offline
MEMORY_SESSION_CACHE: Dict[str, Dict[str, Any]] = {}


async def get_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str
) -> Optional[Dict[str, Any]]:
    """Retrieves short-lived conversational state from Redis or fallback in-memory cache."""
    key = f"session:{channel}:{phone}"
    try:
        raw = await redis.get(key)
        if raw:
            val = raw.decode("utf-8") if isinstance(raw, bytes) else str(raw)
            return json.loads(val)
    except Exception:
        # Fallback to local memory cache if Redis daemon is offline
        return MEMORY_SESSION_CACHE.get(key)
    return MEMORY_SESSION_CACHE.get(key)


async def save_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str, session_data: Dict[str, Any], ttl_seconds: int = 600
) -> None:
    """Saves short-lived conversational state in Redis with 10-min expiration."""
    key = f"session:{channel}:{phone}"
    MEMORY_SESSION_CACHE[key] = session_data
    try:
        await redis.set(key, json.dumps(session_data), ex=ttl_seconds)
    except Exception:
        pass


async def clear_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str
) -> None:
    """Clears conversational state upon completion or cancellation."""
    key = f"session:{channel}:{phone}"
    MEMORY_SESSION_CACHE.pop(key, None)
    try:
        await redis.delete(key)
    except Exception:
        pass
