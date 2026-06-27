#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  token="$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 40 || true)"
  if [ -z "$token" ]; then
    token="change-this-terminal-token"
  fi
  cat > .env <<EOF
SYNTHAI_PORT=8080
CORS_ORIGIN=*
TRIDENT_ONNX_ENABLED=false
TERMINAL_TOKEN=$token
SUPABASE_PRIMARY_URL=https://leisphnjslcuepflefri.supabase.co
SUPABASE_PRIMARY_KEY=sb_publishable_r875ycY951IHyew2SwXEmg_qMOgv9AW
SUPABASE_SECONDARY_URL=
SUPABASE_SECONDARY_KEY=
SUPABASE_APP_BUCKET=synthia-apps
HUGGINGFACE_NAMESPACE=stellarproximology
HF_TOKEN=
TRIDENT_HF_REPO=stellarproximology/Trident
HF_REPO_ID=stellarproximology/Trident
TRIDENT_MODEL_URL=
APP_RUNNER_TIMEOUT_MS=120000
APP_RUNNER_MAX_OUTPUT=120000
EOF
  echo "Created .env with a terminal token."
fi

echo "Starting SynthAIPro all-in-one container..."
docker compose up --build
