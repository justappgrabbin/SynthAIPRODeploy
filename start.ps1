$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
  $token = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
  @"
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
"@ | Set-Content -Path ".env" -Encoding UTF8
  Write-Host "Created .env with a terminal token."
}

Write-Host "Starting SynthAIPro all-in-one container..."
docker compose up --build
