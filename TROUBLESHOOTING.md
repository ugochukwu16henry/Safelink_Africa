# Troubleshooting Guide

## Quick Diagnostic

Run this command to check your setup:

```powershell
npm run check
```

This will verify:
- ✅ Docker Desktop is running
- ✅ PostgreSQL container is running
- ✅ Database tables exist
- ✅ Redis container is running
- ✅ Backend services are running
- ✅ .env file exists

## Common Issues & Solutions

### Issue 1: Services Not Running

**Symptoms:**
- `npm run test:api` shows "NOT RUNNING" for services
- Connection refused errors

**Solution:**
```powershell
# Start all services
npm run dev

# Or start individually
npm run dev:auth
npm run dev:emergency
npm run dev:reporting
npm run dev:transport
npm run dev:notifications
```

**Verify:**
```powershell
# Check health endpoints
Invoke-RestMethod -Uri "http://localhost:3001/health"
Invoke-RestMethod -Uri "http://localhost:3002/health"
# etc.
```

### Issue 2: Database Connection Failed

**Symptoms:**
- `password authentication failed for user "safelink"`
- Migration fails
- Services can't connect to database

**Solution:**
```powershell
# Reset database with correct password
npm run reset:db

# Then run migration
npm run migrate
```

### Issue 3: Database Tables Don't Exist

**Symptoms:**
- API calls return database errors
- "relation does not exist" errors

**Solution:**
```powershell
# Run migration
npm run migrate

# Verify tables
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "\dt"
```

### Issue 4: Port Already in Use

**Symptoms:**
- Services fail to start
- "EADDRINUSE" errors

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in service's .env or docker-compose.yml
```

### Issue 5: Docker Desktop Not Running

**Symptoms:**
- `docker-compose` commands fail
- "dockerDesktopLinuxEngine" errors

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start
3. Verify: `docker --version`
4. Try commands again

### Issue 6: API Tests Fail

**Symptoms:**
- Tests return 401 (Unauthorized)
- Tests return 500 (Server Error)

**Solutions:**

**401 Unauthorized:**
- Make sure you're logged in and have a valid token
- Token may have expired (default: 7 days)
- Login again to get a new token

**500 Server Error:**
- Check service logs: `docker-compose logs <service-name>`
- Verify database is running and migrated
- Check .env file has correct values

**Connection Refused:**
- Services are not running
- Start with: `npm run dev`

### Issue 7: Registration Fails (User Already Exists)

**Symptoms:**
- "User with this phone number already exists"

**Solution:**
```powershell
# Use a different phone number for testing
# The test script generates random numbers automatically
npm run test:api
```

### Issue 8: Migration Script Errors

**Symptoms:**
- Migration fails with SQL errors
- Extensions not found

**Solution:**
```powershell
# Check PostgreSQL logs
docker-compose logs postgres

# Verify extensions are available
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "SELECT * FROM pg_available_extensions WHERE name IN ('postgis', 'uuid-ossp');"

# If missing, recreate container
npm run reset:db
npm run migrate
```

## Step-by-Step Troubleshooting

### 1. Check Prerequisites
```powershell
npm run check
```

### 2. If Database Issues
```powershell
npm run reset:db
npm run migrate
```

### 3. If Services Not Running
```powershell
npm run dev
# Wait 15 seconds
npm run check
```

### 4. Test APIs
```powershell
npm run test:api
```

## Getting Help

If issues persist:

1. **Check logs:**
   ```powershell
   docker-compose logs
   npm run dev:auth  # Check console output
   ```

2. **Verify setup:**
   ```powershell
   npm run check
   npm run verify
   ```

3. **Review documentation:**
   - [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - [DOCKER_SETUP.md](./DOCKER_SETUP.md)
   - [API_TESTING.md](./API_TESTING.md)

## Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Services not running | `npm run dev` |
| Database password error | `npm run reset:db` |
| Tables don't exist | `npm run migrate` |
| Docker not running | Start Docker Desktop |
| Port in use | Kill process or change port |
| API tests fail | Check services running first |

---

**Run `npm run check` first to diagnose issues automatically!**

