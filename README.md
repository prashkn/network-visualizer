# Network Visualizer

A tool that scans your local network for devices and visualizes them in the browser.

## Prerequisites

- Python 3.10+
- Node.js 18+

## Server

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The server runs on http://localhost:8000 by default.

> Note: Network scanning uses ARP requests and may require root/sudo privileges depending on your OS.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173 by default.
