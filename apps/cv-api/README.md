# CV API Backend

FastAPI backend service for the color tracker application.

## Features

- WebSocket video streaming with real-time color detection
- REST API for tracker controls
- CORS enabled for Angular frontend
- Integration with cv-utils library

## Endpoints

### REST API

- `GET /` - API info
- `GET /api/status` - Get tracker status
- `POST /api/start` - Start tracking
- `POST /api/stop` - Stop tracking
- `POST /api/colors/toggle/{color}` - Toggle color detection
- `GET /api/stats` - Get detection statistics
- `POST /api/settings` - Update settings

### WebSocket

- `WS /ws/video` - Video stream with detection overlays

## Running Locally

```bash
cd apps/cv-api
poetry install
poetry run uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

## Testing

```bash
# Test REST endpoints
curl http://localhost:8000/api/status

# Start tracking
curl -X POST http://localhost:8000/api/start

# Get stats
curl http://localhost:8000/api/stats
```
