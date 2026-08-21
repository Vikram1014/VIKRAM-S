from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import uuid

app = FastAPI(title="Internet Sharing Signaling Server")

# Basic in-memory store for MVP. Will be replaced by PostgreSQL.
devices: Dict[str, dict] = {}
connections: Dict[str, dict] = {}

class DeviceRegistrationRequest(BaseModel):
    public_key: str
    device_name: str

class DeviceRegistrationResponse(BaseModel):
    device_id: str
    session_id: str
    connection_token: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Signaling Server is running."}

@app.post("/api/device/register", response_model=DeviceRegistrationResponse)
def register_device(req: DeviceRegistrationRequest):
    device_id = f"DEV-{str(uuid.uuid4())[:8].upper()}"
    session_id = str(uuid.uuid4())
    connection_token = str(uuid.uuid4())[:8].upper() # e.g. ABCD-1234

    devices[device_id] = {
        "public_key": req.public_key,
        "device_name": req.device_name,
        "connection_token": connection_token
    }

    return DeviceRegistrationResponse(
        device_id=device_id,
        session_id=session_id,
        connection_token=connection_token
    )

# Basic WebSocket Signaling for MVP
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, device_id: str):
        await websocket.accept()
        self.active_connections[device_id] = websocket

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]

    async def send_personal_message(self, message: dict, device_id: str):
        if device_id in self.active_connections:
            await self.active_connections[device_id].send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/signaling/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(websocket, device_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle signaling messages (offer, answer, candidates, etc)
            target_device_id = data.get("target_device_id")
            if target_device_id:
                await manager.send_personal_message({
                    "from_device_id": device_id,
                    "payload": data.get("payload")
                }, target_device_id)
    except WebSocketDisconnect:
        manager.disconnect(device_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
