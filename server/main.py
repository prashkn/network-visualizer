import json
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scan import scan, get_local_subnet, get_mac_from_ip

KNOWN_DEVICES_PATH = Path(__file__).parent / "known_devices.json"


def load_known_devices() -> dict[str, str]:
    if KNOWN_DEVICES_PATH.exists():
        return json.loads(KNOWN_DEVICES_PATH.read_text())
    return {}


def save_known_devices(known: dict[str, str]):
    KNOWN_DEVICES_PATH.write_text(json.dumps(known, indent=2))


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class DevicesResponse(BaseModel):
    devices: list[str]


class DeviceRegisterRequest(BaseModel):
    name: str
    mac_address: str | None = None

@app.get("/devices", response_model=DevicesResponse)
def get_devices():
    subnet = get_local_subnet()
    if not subnet:
        return {"error": "Could not detect local subnet"}, 500
    devices = scan(subnet)
    print("Discovered devices:", devices)

    # load known devices from JSON file.
    known = load_known_devices()

    # if any device matches, return the name instead of the mac address
    return DevicesResponse(
        devices=[known.get(d["mac"], d["mac"]) for d in devices]
    )

@app.post("/devices")
def register_device(body: DeviceRegisterRequest, request: Request):
    mac = body.mac_address
    if not mac:
        mac = get_mac_from_ip(request.client.host)
        if not mac:
            return {"error": "Could not determine MAC address from caller"}, 400

    known = load_known_devices()
    known[mac] = body.name
    save_known_devices(known)
    return {"mac_address": mac, "name": body.name}
