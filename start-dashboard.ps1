# Sentinel-Scan Dashboard Startup Script
# Starts the dashboard backend (port 8001) AND optionally seeds the database
# Run from the project root: d:\sential scan

param(
    [switch]$Seed,    # Pass -Seed to populate MongoDB with demo data first
    [switch]$SkipDB   # Pass -SkipDB to skip the MongoDB check prompt
)

$ErrorActionPreference = 'Stop'
$ROOT = $PSScriptRoot

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host " Sentinel-Scan Dashboard Backend Startup" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ---- 1. Check Python ----
Write-Host "1. Checking Python..." -ForegroundColor Yellow
try { python --version } catch {
    Write-Host "   ❌ Python not found. Install Python 3.11+." -ForegroundColor Red; exit 1
}

# ---- 2. Activate venv ----
$venvActivate = Join-Path $ROOT "backend\venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvActivate)) {
    Write-Host "`n2. Creating virtual environment..." -ForegroundColor Yellow
    python -m venv (Join-Path $ROOT "backend\venv")
}
Write-Host "`n2. Activating virtual environment..." -ForegroundColor Yellow
& $venvActivate

# ---- 3. Install dashboard backend deps ----
Write-Host "`n3. Installing dashboard backend dependencies..." -ForegroundColor Yellow
$dashReqs = Join-Path $ROOT "dashboard\backend\requirements.txt"
pip install -r $dashReqs -q

# ---- 4. MongoDB check ----
if (-not $SkipDB) {
    Write-Host "`n4. MongoDB Check" -ForegroundColor Yellow
    Write-Host "   MongoDB must be running on localhost:27017." -ForegroundColor White
    $running = Read-Host "   Is MongoDB running? (y/n)"
    if ($running -ne 'y') {
        Write-Host "`n   ❌ Start MongoDB first, then re-run this script." -ForegroundColor Red
        exit 1
    }
}

# ---- 5. Seed the database (optional) ----
if ($Seed) {
    Write-Host "`n5. Seeding MongoDB with demo data..." -ForegroundColor Yellow
    python (Join-Path $ROOT "dashboard\backend\seed_db.py")
    Write-Host "   ✅ Database seeded." -ForegroundColor Green
} else {
    Write-Host "`n5. Skipping seed (pass -Seed to populate demo data)" -ForegroundColor DarkGray
}

# ---- 6. Start dashboard backend ----
Write-Host "`n6. Starting Dashboard API on http://localhost:8001 ..." -ForegroundColor Green
Write-Host "   Docs: http://localhost:8001/docs" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop.`n" -ForegroundColor DarkGray

# Load .env from project root so settings pick up API keys / MongoDB URL
$env:ENV_FILE = Join-Path $ROOT ".env"
Set-Location $ROOT
python -m uvicorn dashboard.backend.main:app --host 0.0.0.0 --port 8001 --reload --env-file ".env"
