# SynthAIPro All-in-One

This is the merged deploy repo for `synthai.pro`.

It contains:

- `SynthAIPro/` frontend
- `Synthia-server/` backend
- one Docker image that builds and runs both
- upload, ingest, analyze, regenerate, mount, and execute pipeline
- Supabase Storage mirroring
- Hugging Face/Trident and MCP settings
- phone-friendly boot terminal

## Run Locally On Windows

```powershell
.\start.ps1
```

Open:

```text
http://localhost:8080
```

## Run On Linux Or Mac

```bash
chmod +x ./start.sh
./start.sh
```

## Deploy

On a Linux server with Docker:

```bash
docker compose up --build -d
```

Point `synthai.pro` to that server and proxy HTTPS traffic to host port `8080`.

## Notes

Runtime uploads are stored under `data/`, which is intentionally ignored by git.
