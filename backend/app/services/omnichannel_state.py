import json
from typing import Optional, Dict, Any
import redis.asyncio as aioredis


async def get_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str
) -> Optional[Dict[str, Any]]:
    """Retrieves short-lived conversational state from Redis (TTL = 600s)."""
    key = f"session:{channel}:{phone}"
    raw = await redis.get(key)
    if raw:
        val = raw.decode("utf-8") if isinstance(raw, bytes) else str(raw)
        return json.loads(val)
    return None


async def save_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str, session_data: Dict[str, Any], ttl_seconds: int = 600
) -> None:
    """Saves short-lived conversational state in Redis with 10-min expiration."""
    key = f"session:{channel}:{phone}"
    await redis.set(key, json.dumps(session_data), ex=ttl_seconds)


async def clear_conversational_session(
    redis: aioredis.Redis, channel: str, phone: str
) -> None:
    """Clears conversational state upon completion or cancellation."""
    key = f"session:{channel}:{phone}"
    await redis.delete(key)
