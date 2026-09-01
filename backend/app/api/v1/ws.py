from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket_manager import manager

router = APIRouter(tags=["Realtime WebSockets"])


@router.websocket("/ws/queue/{center_id}")
async def queue_websocket_endpoint(websocket: WebSocket, center_id: str):
    """
    Real-time WebSocket room endpoint for live queue updates per procurement center.
    Events: token_called, queue_updated, msp_updated, new_complaint.
    """
    await manager.connect(websocket, center_id)
    try:
        while True:
            # Handle client heartbeats or incoming messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, center_id)
