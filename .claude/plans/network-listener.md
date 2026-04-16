# Plan: Background Network Listener for New Device Detection

## Context
The server has REST APIs (`GET /devices`, `POST /devices`) for network scanning and device registration. We need a background listener that continuously monitors the network and prints when a new device (MAC address) joins.

## Approach
Use FastAPI's **lifespan** + **`asyncio.to_thread`** to run periodic ARP scans in the background. The blocking `scan()` call runs in a thread pool; everything else is async. On the first scan, all discovered MACs are seeded silently — only subsequent new MACs trigger a print.

To avoid a circular import (`main.py` ↔ `listener.py`), extract shared helpers into `devices.py`.

## Changes

### 1. Create `server/devices.py`
Extract from `main.py`:
- `KNOWN_DEVICES_PATH`
- `load_known_devices()`
- `save_known_devices()`

### 2. Create `server/listener.py`
- `async def network_listener(interval=30)` — loops forever:
  - Calls `scan(subnet)` via `asyncio.to_thread`
  - Compares current MACs against `seen_macs` set
  - First scan: seeds `seen_macs` silently
  - Subsequent scans: for each new MAC, prints `"device {name} joined"` using friendly name from `load_known_devices()` or raw MAC
  - Sleeps `interval` seconds between scans

### 3. Modify `server/main.py`
- Import `load_known_devices`, `save_known_devices` from `devices` (remove inline definitions)
- Import `network_listener` from `listener`
- Add `lifespan` context manager that creates/cancels the listener task
- Pass `lifespan=lifespan` to `FastAPI()`
- Add `SCAN_INTERVAL = 30` constant

### No changes to
- `server/scan.py`
- `server/known_devices.json`

## Verification
1. Run `sudo uvicorn main:app --reload` from `server/`
2. First scan should log "Seeded with N device(s)" — no "joined" messages
3. Connect a new device to the network (or have someone join WiFi)
4. Within ~30s, see `device <name-or-mac> joined` printed to the console
5. Verify `GET /devices` and `POST /devices` still work as before
