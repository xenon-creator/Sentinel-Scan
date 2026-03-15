# Sentinel-Scan Backend Testing Guide

## Quick Test: Start the Backend

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start MongoDB and Redis (Docker)

```bash
# From project root
docker run -d -p 27017:27017 --name sentinel-mongodb mongo:7
docker run -d -p 6379:6379 --name sentinel-redis redis:7-alpine
```

### 3. Create .env File

```bash
copy .env.example .env
```

### 4. Run the Backend

```bash
cd backend
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload
```

### 5. Test the API

**Open your browser:**
- http://localhost:8000 - Root endpoint
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/health - Health check

**Test with curl:**

```bash
# Health check
curl http://localhost:8000/health

# List plugins
curl http://localhost:8000/api/v1/plugins

# Create a scan
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d "{\"target\": \"scanme.nmap.org\", \"scan_types\": [\"network\"]}"

# Get scan status (replace {scan_id} with actual ID from previous response)
curl http://localhost:8000/api/v1/scans/{scan_id}

# List all scans
curl http://localhost:8000/api/v1/scans

# List findings
curl http://localhost:8000/api/v1/findings
```

## Expected Output

### Health Check Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "plugins": 1
}
```

### Plugins List:
```json
{
  "plugins": [
    {
      "name": "nmap",
      "version": "1.0.0",
      "description": "Network port scanner and service detector using Nmap",
      "supported_targets": ["ip", "domain", "cidr"],
      "initialized": false
    }
  ]
}
```

### Create Scan Response:
```json
{
  "scan_id": "550e8400-e29b-41d4-a716-446655440000",
  "target": "scanme.nmap.org",
  "scan_types": ["network"],
  "status": "queued",
  "progress": 0,
  "findings_count": 0,
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_duration": "5-15 minutes"
}
```

## Troubleshooting

### "Module not found" errors
Make sure you're in the backend directory and virtual environment is activated:
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### "Connection refused" to MongoDB
Check if MongoDB is running:
```bash
docker ps | findstr mongodb
```

Start if not running:
```bash
docker start sentinel-mongodb
```

### Nmap not found
Install Nmap:
- Windows: Download from https://nmap.org/download.html
- Add to PATH after installation

### Import errors
Make sure all `__init__.py` files are created in:
- backend/
- backend/api/
- backend/api/routes/
- backend/core/
- backend/db/
- backend/models/
- backend/plugins/

## Next Steps

Once the backend is running successfully:

1. ✅ Test all API endpoints
2. ✅ Verify scan execution
3. ✅ Check findings storage
4. 🔜 Build frontend dashboard
5. 🔜 Add more scanner plugins
6. 🔜 Implement CVE enrichment
