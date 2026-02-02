# Docker Setup Guide for SafeLink Africa

## Prerequisites

1. **Docker Desktop** must be installed and running
2. **Docker Compose** (included with Docker Desktop)

## 🚨 Common Issues

### Issue: "The system cannot find the file specified" / "dockerDesktopLinuxEngine"

**Problem**: Docker Desktop is not running.

**Solution**:
1. Open **Docker Desktop** application
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Verify it's running: Open Docker Desktop and check status is "Running"
4. Try the command again

### Issue: "version attribute is obsolete"

**Status**: ✅ Fixed - Removed version from docker-compose.yml

## ✅ Step-by-Step Setup

### Step 1: Start Docker Desktop

**Windows**:
1. Search for "Docker Desktop" in Start menu
2. Click to open Docker Desktop
3. Wait for it to start (may take 1-2 minutes)
4. Look for Docker icon in system tray (bottom right)
5. Right-click icon → "Settings" to verify it's running

**Verify Docker is Running**:
```powershell
docker --version
docker-compose --version
```

Both commands should return version numbers without errors.

### Step 2: Start Database Services

```powershell
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Check if containers are running
docker-compose ps

# View logs if needed
docker-compose logs postgres
docker-compose logs redis
```

### Step 3: Verify Services

```powershell
# Check PostgreSQL is accessible
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "SELECT version();"

# Check Redis is accessible
docker exec -it safelink-redis redis-cli ping
```

Expected output:
- PostgreSQL: Should show version info
- Redis: Should return "PONG"

## 🔧 Troubleshooting

### Docker Desktop Won't Start

1. **Check Windows Features**:
   - Open "Turn Windows features on or off"
   - Ensure "Virtual Machine Platform" and "Windows Subsystem for Linux" are enabled
   - Restart computer if you enable these

2. **Check WSL2**:
   ```powershell
   wsl --status
   ```
   Should show WSL version 2

3. **Restart Docker Desktop**:
   - Right-click Docker icon in system tray
   - Click "Restart Docker Desktop"
   - Wait for it to fully restart

### Port Already in Use

If you get "port already in use" error:

```powershell
# Find what's using the port (example for port 5432)
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Container Won't Start

```powershell
# Check container logs
docker-compose logs postgres
docker-compose logs redis

# Remove and recreate containers
docker-compose down
docker-compose up -d postgres redis
```

### Database Connection Issues

```powershell
# Check if PostgreSQL container is running
docker ps | findstr postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Access PostgreSQL directly
docker exec -it safelink-postgres psql -U safelink -d safelink_africa
```

## 📋 Quick Commands Reference

```powershell
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres

# Restart a service
docker-compose restart postgres

# Rebuild containers
docker-compose build

# Check Docker status
docker info
```

## ✅ Verification Checklist

Before proceeding with database migration:

- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (check system tray)
- [ ] `docker --version` works
- [ ] `docker-compose --version` works
- [ ] PostgreSQL container is running (`docker-compose ps`)
- [ ] Redis container is running (`docker-compose ps`)
- [ ] Can connect to PostgreSQL (`docker exec -it safelink-postgres psql -U safelink -d safelink_africa`)

## 🎯 Next Steps

Once Docker is running:

1. ✅ Start database services: `docker-compose up -d postgres redis`
2. ✅ Run migration: `npm run migrate`
3. ✅ Start backend services: `npm run dev`
4. ✅ Verify setup: `npm run verify`

---

**Need Help?** Check Docker Desktop logs:
- Click Docker icon in system tray
- Select "Troubleshoot"
- View logs for detailed error messages

