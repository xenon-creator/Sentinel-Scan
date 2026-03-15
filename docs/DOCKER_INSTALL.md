# Docker Installation Guide for Windows

## Quick Install (Recommended)

### Step 1: Download Docker Desktop

1. **Visit:** https://www.docker.com/products/docker-desktop/
2. **Click:** "Download for Windows"
3. **File:** `Docker Desktop Installer.exe` (~500MB)

### Step 2: Install Docker Desktop

1. **Run the installer** (double-click the downloaded file)
2. **Configuration:**
   - ✅ Use WSL 2 instead of Hyper-V (recommended)
   - ✅ Add shortcut to desktop
3. **Click:** "Ok" and wait for installation
4. **Restart your computer** when prompted

### Step 3: Start Docker Desktop

1. **Launch:** Docker Desktop from Start Menu
2. **Accept:** Terms of Service
3. **Wait:** For Docker Engine to start (whale icon in system tray will stop animating)
4. **Skip:** Tutorial (optional)

### Step 4: Verify Installation

Open PowerShell and run:

```powershell
docker --version
# Should show: Docker version 24.x.x

docker ps
# Should show: Empty list (no containers running)
```

## System Requirements

- **Windows 10/11** (64-bit)
- **WSL 2** (Windows Subsystem for Linux)
- **4GB RAM minimum** (8GB recommended)
- **Virtualization enabled** in BIOS

## Enable WSL 2 (If Not Already Enabled)

If Docker installer asks you to enable WSL 2:

```powershell
# Run as Administrator
wsl --install
```

Then restart your computer.

## Troubleshooting

### "WSL 2 installation is incomplete"

1. Open PowerShell as Administrator
2. Run:
   ```powershell
   wsl --update
   wsl --set-default-version 2
   ```
3. Restart Docker Desktop

### "Virtualization is not enabled"

1. Restart computer and enter BIOS (usually F2, F10, or Del key)
2. Find "Virtualization Technology" or "Intel VT-x" / "AMD-V"
3. Enable it
4. Save and exit BIOS

### Docker Desktop won't start

1. **Check Windows Updates** - Install all pending updates
2. **Restart Docker Desktop** - Right-click system tray icon → Restart
3. **Reinstall** - Uninstall and reinstall Docker Desktop

## After Docker is Installed

### Start Sentinel-Scan with Docker

```powershell
# Navigate to project
cd "d:\sential scan"

# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Verify they're running
docker ps

# You should see:
# - sentinel-mongodb (port 27017)
# - sentinel-redis (port 6379)
```

### Then Start the Backend

```powershell
# Install Python dependencies
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start the API
python main.py
```

### Or Use Full Docker Setup

```powershell
# Start everything (MongoDB, Redis, API)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Alternative: MongoDB Atlas (No Docker Needed)

If you don't want to install Docker, use MongoDB's free cloud service:

1. **Sign up:** https://www.mongodb.com/cloud/atlas/register
2. **Create cluster** (free M0 tier)
3. **Get connection string**
4. **Update `.env`:**
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/sentinel_scan
   ```

## Quick Commands Reference

```powershell
# Check Docker status
docker --version
docker ps

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f api

# Restart a service
docker-compose restart api

# Remove all containers and volumes
docker-compose down -v
```

## Next Steps After Docker Installation

1. ✅ Install Docker Desktop
2. ✅ Verify with `docker --version`
3. ✅ Run `docker-compose up -d mongodb redis`
4. ✅ Start backend: `cd backend && python main.py`
5. ✅ Test: http://localhost:8000/health

---

**Need help?** Docker documentation: https://docs.docker.com/desktop/install/windows-install/
