# SynthAIPro All-in-One

This is the merged deploy repo for `synthai.pro`.

It contains:

- `SynthAIPro/` frontend mobile/web shell
- `Synthia-server/` backend
- one Docker image that builds and runs both
- upload, ingest, analyze, regenerate, mount, and execute pipeline
- Supabase Storage mirroring
- Hugging Face/Trident and MCP settings
- phone-friendly boot terminal
- Android APK build workflow through Capacitor

## Repo Order

```text
SynthAIPRODeploy/
├─ SynthAIPro/                 # APK/web frontend
│  ├─ src/                     # React app shell
│  ├─ index.html               # Vite entry
│  ├─ vite.config.js           # Web/APK build config
│  └─ capacitor.config.json    # Android wrapper config
├─ Synthia-server/             # Node backend/runtime
├─ .github/workflows/
│  └─ android-apk.yml          # Builds downloadable debug APK
├─ Dockerfile                  # Full web + backend container
├─ docker-compose.yml          # Local/server deploy
├─ start.sh                    # Linux/Mac Docker launcher
└─ start.ps1                   # Windows Docker launcher
```

## Build APK In GitHub

1. Open the repo on GitHub.
2. Go to **Actions**.
3. Choose **Build Android APK**.
4. Click **Run workflow**.
5. When it finishes, download the artifact named `SynthAIPro-debug-apk`.
6. Inside the artifact ZIP, install `app-debug.apk` on Android.

The APK currently wraps the `SynthAIPro/` frontend. Backend calls are optional so the app can still open even when the runtime server is not running.

## Build APK Locally

```bash
cd SynthAIPro
npm install
npm install --save-dev @capacitor/cli @capacitor/core @capacitor/android
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output:

```text
SynthAIPro/android/app/build/outputs/apk/debug/app-debug.apk
```

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
The generated Android folder is also ignored because GitHub Actions regenerates it from the Capacitor config.
