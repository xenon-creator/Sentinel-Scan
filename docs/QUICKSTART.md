# Sentinel-Scan Quick Start Guide (No Docker)

## Prerequisites

Since Docker is not installed, you'll need to install MongoDB and Redis manually:

### Option 1: Install MongoDB Locally (Recommended for Windows)

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download Windows version
   - Run installer (use default settings)

2. **Start MongoDB:**
   ```powershell
   # MongoDB should start automatically as a service
   # Or manually start it:
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```powershell
   # Should connect without errors
   mongosh
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster**
3. **Get connection string** (looks like: `mongodb+srv://....`)
4. **Update `.env` file** with your connection string

### Option 3: Install Docker Desktop

1. **Download:** https://www.docker.com/products/docker-desktop
2. **Install and restart**
3. **Run:** `docker-compose up -d mongodb redis`

## Quick Start (After MongoDB is Running)

### Step 1: Install Dependencies

```powershell
# Create virtual environment
cd backend
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment

The `.env` file is already created. If using MongoDB Atlas, update the `MONGODB_URL`:

```env
MONGODB_URL=mongodb+srv://your-connection-string
```

### Step 3: Start the Backend

```powershell
cd backend
python main.py
```

Or use uvicorn directly:
```powershell
uvicorn main:app --reload
```

### Step 4: Test the API

Open your browser:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

Or use curl:
```powershell
curl http://localhost:8000/health
```

## Troubleshooting

### "Module not found" errors

Make sure virtual environment is activated:
```powershell
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### "Connection refused" to MongoDB

**Check if MongoDB is running:**
```powershell
# Windows Service
net start MongoDB

# Or check services
services.msc
# Look for "MongoDB Server"
```

**If using MongoDB Atlas:**
- Verify connection string in `.env`
- Check IP whitelist in Atlas dashboard
- Ensure database user has correct permissions

### Nmap not found

**Install Nmap:**
1. Download from: https://nmap.org/download.html
2. Run installer
3. Add to PATH: `C:\Program Files (x86)\Nmap`
4. Restart terminal

**Verify:**
```powershell
nmap --version
```

## Alternative: Use Automated Script

Run the quick start script:
```powershell
.\start-backend.ps1
```

This will:
1. Check Python installation
2. Create virtual environment
3. Install dependencies
4. Prompt for MongoDB status
5. Start the FastAPI server

## What's Next?

Once the backend is running:

1. ✅ Test health endpoint: `curl http://localhost:8000/health`
2. ✅ View API docs: http://localhost:8000/docs
3. ✅ Create a test scan (see TESTING.md)
4. 🔜 Build the frontend dashboard
5. 🔜 Add more scanner plugins

## Need Help?

- **MongoDB Installation:** https://www.mongodb.com/docs/manual/installation/
- **Python Virtual Environments:** https://docs.python.org/3/library/venv.html
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
