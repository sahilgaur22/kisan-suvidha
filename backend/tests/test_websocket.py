from unittest.mock import AsyncMock, MagicMock
import pytest
from app.websocket_manager import ConnectionManager


@pytest.mark.asyncio
async def test_connection_manager_room_scoping():
    """Verify WebSocket manager connects, broadcasts to center room, and disconnects."""
    manager = ConnectionManager()
    mock_ws = AsyncMock()

    center_id = "center-101"
    await manager.connect(mock_ws, center_id)

    assert center_id in manager.active_connections
    assert mock_ws in manager.active_connections[center_id]

    # Broadcast message
    msg = {"event": "queue_updated", "center_id": center_id}
    await manager.broadcast_to_center(center_id, msg)
    mock_ws.send_json.assert_called_once_with(msg)

    # Disconnect
    manager.disconnect(mock_ws, center_id)
    assert center_id not in manager.active_connections
