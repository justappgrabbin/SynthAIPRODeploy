# Self-host SynthAIPro

SynthAIPro is containerized as a Vite-built React app served by the included Express `server.js`.

## Quick start

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/health
```

## Connect the Synthia API

The browser app expects a Synthia API and WebSocket service. Configure these before building the image:

```bash
VITE_SYNTHIA_API_URL=https://your-api.example.com \
VITE_SYNTHIA_WS_URL=wss://your-api.example.com/ws \
docker compose up --build
```

On Windows PowerShell:

```powershell
$env:VITE_SYNTHIA_API_URL="https://your-api.example.com"
$env:VITE_SYNTHIA_WS_URL="wss://your-api.example.com/ws"
docker compose up --build
```

If those values are not set, the UI still runs, but API-backed panels will show connection errors until the Synthia service is available.

## Change the host port

```bash
SYNTHAIPRO_PORT=3000 docker compose up --build
```

## Files added for self-hosting

- `Dockerfile` builds the app and serves `dist/` through Node/Express.
- `docker-compose.yml` runs the container on host port `8080`.
- `.dockerignore` keeps local dependencies, build output, and secrets out of the image context.
