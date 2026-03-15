# 🚀 Sentinel-Scan - Getting Started

## Current Status

✅ **Backend Code:** Complete  
⏳ **Dependencies:** Installing...  
❌ **Docker:** Not installed  
❌ **MongoDB:** Not running  

## Next Steps (Choose One Path)

### Path A: Install Docker (Recommended - Easiest)

**Why?** Docker makes it super easy to run MongoDB and Redis without manual installation.

**Steps:**
1. **Install Docker Desktop:**
   - Download: https://www.docker.com/products/docker-desktop/
   - Run installer
   - Restart computer
   - See [`DOCKER_INSTALL.md`](file:///d:/sential%20scan/DOCKER_INSTALL.md) for detailed guide

2. **Start Services:**
   ```powershell
   docker-compose up -d mongodb redis
   ```

3. **Start Backend:**
   ```powershell
   cd backend
   venv\Scripts\activate
   python main.py
   ```

4. **Test:**
   - Open: http://localhost:8000/docs

---

### Path B: Use MongoDB Atlas (No Docker Needed)

**Why?** Free cloud database, no local installation needed.

**Steps:**
1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster** (M0 tier)
3. **Get connection string**
4. **Create `.env` file** (copy from `.env.example`):
   ```env
   MONGODB_URL=mongodb+srv://.....
   ```
5. **Start Backend:**
   ```powershell
   cd backend
   venv\Scripts\activate
   python main.py
   ```

---

### Path C: Install MongoDB Locally

**Why?** Full control, no internet needed.

**Steps:**
1. **Download:** https://www.mongodb.com/try/download/community
2. **Install** (use default settings)
3. **Start MongoDB service**
4. **Start Backend:**
   ```powershell
   cd backend
   venv\Scripts\activate
   python main.py
   ```

---

## Quick Commands

```powershell
# Activate virtual environment
cd backend
venv\Scripts\activate

# Install dependencies (if not done)
pip install -r requirements.txt

# Start the backend
python main.py

# Test the API
curl http://localhost:8000/health
```

## What You'll See When It Works

```json
{
  "status": "healthy",
  "database": "connected",
  "plugins": 1
}
```

## Files Created

- ✅ Backend code (FastAPI, MongoDB, Nmap scanner)
- ✅ Docker configuration
- ✅ Documentation (README, TESTING, QUICKSTART)
- ✅ Virtual environment
- ⏳ Dependencies installing...

## Need Help?

- **Docker Installation:** [`DOCKER_INSTALL.md`](file:///d:/sential%20scan/DOCKER_INSTALL.md)
- **Quick Start Guide:** [`QUICKSTART.md`](file:///d:/sential%20scan/QUICKSTART.md)
- **Testing Guide:** [`TESTING.md`](file:///d:/sential%20scan/TESTING.md)
- **Backend README:** [`backend/README.md`](file:///d:/sential%20scan/backend/README.md)

## Recommended: Install Docker

Docker is the easiest way to get started. It will:
- ✅ Run MongoDB automatically
- ✅ Run Redis automatically
- ✅ Handle all dependencies
- ✅ Work the same on any computer

**Download:** https://www.docker.com/products/docker-desktop/
