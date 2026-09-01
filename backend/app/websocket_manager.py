from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """
    Center-Scoped WebSocket Connection Manager.
    Organizes active client sockets into rooms keyed by center_id.
    """

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, center_id: str) -> None:
        """Accepts WebSocket connection and joins center room."""
        await websocket.accept()
        if center_id not in self.active_connections:
            self.active_connections[center_id] = []
        self.active_connections[center_id].append(websocket)

    def disconnect(self, websocket: WebSocket, center_id: str) -> None:
        """Removes WebSocket from center room on disconnect."""
        if center_id in self.active_connections:
            if websocket in self.active_connections[center_id]:
                self.active_connections[center_id].remove(websocket)
            if not self.active_connections[center_id]:
                del self.active_connections[center_id]

    async def broadcast_to_center(self, center_id: str, message: dict) -> None:
        """Broadcasts real-time JSON updates to all clients in a specific center room."""
        if center_id in self.active_connections:
            disconnected_sockets = []
            for connection in self.active_connections[center_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected_sockets.append(connection)

            # Cleanup broken sockets
            for broken in disconnected_sockets:
                self.disconnect(broken, center_id)


# Singleton connection manager instance
manager = ConnectionManager()
