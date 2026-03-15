# Sentinel-Scan Backend

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env with your configuration
```

### 3. Start MongoDB and Redis

**Option A: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Option B: Using Docker Compose**
```bash
# From project root
docker-compose up -d mongodb redis
```

### 4. Run the Application

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## API Usage Examples

### Create a Scan

```bash
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d '{
    "target": "scanme.nmap.org",
    "scan_types": ["network"],
    "options": {
      "port_range": "1-1000",
      "scan_speed": "normal"
    }
  }'
```

### Get Scan Status

```bash
curl http://localhost:8000/api/v1/scans/{scan_id}
```

### List Findings

```bash
curl http://localhost:8000/api/v1/findings?scan_id={scan_id}
```

### Register an Asset

```bash
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Content-Type: application/json" \
  -d '{
    "hostname": "web-server-01",
    "ip_address": "192.168.1.10",
    "asset_type": "server",
    "criticality": "high",
    "tags": ["production", "web"]
  }'
```

## Project Structure

```
backend/
├── api/
│   └── routes/          # API endpoints
├── core/                # Core business logic
├── db/                  # Database utilities
├── models/              # Pydantic models
├── plugins/             # Scanner plugins
├── utils/               # Helper functions
├── config.py            # Configuration
├── main.py              # FastAPI app
└── requirements.txt     # Dependencies
```

## Available Scanner Plugins

- ✅ **Nmap** - Network port scanner
- 🔜 **Nuclei** - Vulnerability scanner (coming soon)
- 🔜 **OWASP ZAP** - Web application scanner (coming soon)
- 🔜 **Trivy** - Container scanner (coming soon)

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black .
flake8 .
```

### Type Checking

```bash
mypy .
```

## Troubleshooting

### Nmap Not Found

If you get "nmap not found" error:

**Windows:**
1. Download Nmap from https://nmap.org/download.html
2. Install and add to PATH

**Linux:**
```bash
sudo apt-get install nmap
```

**Mac:**
```bash
brew install nmap
```

### MongoDB Connection Error

Ensure MongoDB is running:
```bash
docker ps | grep mongodb
```

If not running:
```bash
docker start mongodb
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `DEBUG` - Enable debug mode
- `NVD_API_KEY` - NVD API key for CVE enrichment (optional)
