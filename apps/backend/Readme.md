# Doodozer Backend API

Express REST API for managing DoodStream video downloads via Docker containers.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env and set your DOODOZER_IMAGE
```

### 3. Run
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

API will be available at `http://localhost:3000`

## Requirements

- Node.js 18+
- Docker running locally
- Access to Docker socket (`/var/run/docker.sock`)
- Doodozer Docker image available (from GHCR)

## Docker Socket Permissions

### Linux/Mac
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Or temporarily:
sudo chmod 666 /var/run/docker.sock
```

### Windows (WSL2)
Docker Desktop handles this automatically.

## API Endpoints

### POST /api/downloads/start
Start a new download.

**Request:**
```json
{
  "url": "https://doodstream.com/e/abc123",
  "filename": "my-video.mp4",
  "metadata": {
    "category": "Movies",
    "tags": "action, thriller"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://doodstream.com/e/abc123",
  "filename": "my-video.mp4",
  "progress": 0,
  "speed": 0,
  "eta": 300,
  "status": "downloading",
  "containerId": "docker-container-id",
  "metadata": { ... }
}
```

### GET /api/downloads/active
Get all active downloads.

**Response:**
```json
[
  {
    "id": "uuid",
    "url": "...",
    "filename": "...",
    "progress": 45,
    "speed": 2.5,
    "eta": 120,
    "status": "downloading",
    "containerId": "...",
    "metadata": { ... }
  }
]
```

### DELETE /api/downloads/:id
Stop a download.

**Response:** `204 No Content`

### GET /api/stats
Get download statistics.

**Response:**
```json
{
  "activeDownloads": 2,
  "queuedDownloads": 0,
  "completedToday": 5
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## How It Works

1. **Start Download:** Creates a Docker container using the Doodozer image
2. **Monitor Progress:** Polls container logs every 2 seconds to extract progress
3. **Parse Logs:** Extracts percentage and speed from Doodozer output
4. **Update Status:** Tracks container state (downloading/completed/failed)
5. **Stop Download:** Stops and removes the container

## Progress Detection

The backend parses Doodozer's log output to extract:
- **Progress:** Matches patterns like `45%`
- **Speed:** Matches patterns like `2.5 MB/s`

**Note:** Adjust regex patterns in `parseProgress()` function if Doodozer's output format differs.

## Downloads Storage

Videos are saved to `./downloads` directory (configurable via `DOWNLOADS_PATH`).

Each container mounts this directory to `/downloads`.

## Status Values

- `downloading` - Currently downloading
- `processing` - Container running but no progress yet
- `completed` - Download finished successfully (exit code 0)
- `failed` - Download failed (non-zero exit code or stopped)

## Background Monitoring

The server runs a background task every 2 seconds to:
- Check container status
- Update progress/speed/ETA
- Detect completed/failed downloads

## Cleanup

On `SIGINT` (Ctrl+C), the server gracefully stops all running containers.

## Troubleshooting

### "Cannot connect to Docker daemon"
- Ensure Docker is running
- Check socket path: `/var/run/docker.sock`
- Verify permissions (see Docker Socket Permissions above)

### "Image not found"
- Pull the image manually: `docker pull ghcr.io/YOUR_USERNAME/doodozer:latest`
- Check `.env` has correct `DOODOZER_IMAGE`

### Progress shows 0%
- Check Doodozer's actual log output: `docker logs <container-id>`
- Adjust regex in `parseProgress()` to match the format

### Downloads not stopping
- Check container logs: `docker ps` and `docker logs <id>`
- Manually stop: `docker stop <container-name>`

## Production Deployment

### Using Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./downloads:/app/downloads
    environment:
      - DOODOZER_IMAGE=ghcr.io/YOUR_USERNAME/doodozer:latest
    restart: unless-stopped
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `DOODOZER_IMAGE` - Docker image to use
- `DOWNLOADS_PATH` - Where to save downloads

## Development

### Enable Debug Logs
```javascript
// Add at top of server.js
process.env.DEBUG = 'dockerode:*';
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Start download
curl -X POST http://localhost:3000/api/downloads/start \
  -H "Content-Type: application/json" \
  -d '{"url":"https://doodstream.com/e/test","filename":"test.mp4"}'

# Get active downloads
curl http://localhost:3000/api/downloads/active

# Get stats
curl http://localhost:3000/api/stats
```

## License

MIT