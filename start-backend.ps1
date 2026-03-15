# Quick Start Script for Sentinel-Scan Backend
# This script starts the backend WITHOUT Docker (for development)

Write-Host "🚀 Starting Sentinel-Scan Backend..." -ForegroundColor Cyan

# Check Python
Write-Host "`n1. Checking Python..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "backend\venv")) {
    Write-Host "`n2. Creating virtual environment..." -ForegroundColor Yellow
    python -m venv backend\venv
}

# Activate virtual environment
Write-Host "`n3. Activating virtual environment..." -ForegroundColor Yellow
& backend\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "`n4. Installing dependencies..." -ForegroundColor Yellow
pip install -r backend\requirements.txt

# Check for MongoDB
Write-Host "`n5. Checking for MongoDB..." -ForegroundColor Yellow
Write-Host "⚠️  MongoDB is required but Docker is not installed." -ForegroundColor Yellow
Write-Host "   Options:" -ForegroundColor White
Write-Host "   A) Install MongoDB locally: https://www.mongodb.com/try/download/community" -ForegroundColor White
Write-Host "   B) Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
Write-Host "   C) Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Do you have MongoDB running? (y/n)"

if ($choice -ne "y") {
    Write-Host "`n❌ Please install and start MongoDB first." -ForegroundColor Red
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Start the backend
Write-Host "`n6. Starting FastAPI server..." -ForegroundColor Yellow
Write-Host "   API will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "   Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

cd backend
python main.py
