# Database Setup Guide

## 🔐 Password Authentication Issue

If you get `password authentication failed for user "safelink"`, follow these steps:

## Quick Fix

### Option 1: Recreate Database Container (Recommended)

```powershell
# Stop and remove PostgreSQL container
docker-compose down postgres

# Remove the volume (WARNING: This deletes all data)
docker volume rm safelink-africa_postgres_data

# Start PostgreSQL again with correct password
docker-compose up -d postgres

# Wait 15 seconds for it to start
Start-Sleep -Seconds 15

# Run migration
npm run migrate
```

### Option 2: Use Quick Fix Script (Easiest)

```powershell
# Quick fix - recreates container automatically
npm run quick-fix:db

# Then run migration
npm run migrate
```

### Option 3: Use Interactive Fix Script

```powershell
# Interactive fix script with options
npm run fix:db
```

## 🔧 Manual Fix Steps

### Step 1: Create .env File

The `.env` file is required. Create it with:

```powershell
# Copy from example (if exists)
Copy-Item .env.example .env

# Or create manually
@"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safelink_africa
DB_USER=safelink
DB_PASSWORD=safelink_dev_password
"@ | Out-File -FilePath ".env" -Encoding utf8
```

### Step 2: Verify .env File

Check that `.env` contains:
```
DB_PASSWORD=safelink_dev_password
```

### Step 3: Ensure Docker Compose Uses Same Password

The `docker-compose.yml` should have:
```yaml
environment:
  POSTGRES_PASSWORD: safelink_dev_password
```

### Step 4: Recreate Container

If the container was created with a different password:

```powershell
# Stop container
docker-compose stop postgres

# Remove container
docker-compose rm -f postgres

# Remove volume (deletes data)
docker volume rm safelink-africa_postgres_data

# Start fresh
docker-compose up -d postgres
```

### Step 5: Wait and Migrate

```powershell
# Wait for PostgreSQL to be ready
Start-Sleep -Seconds 15

# Run migration
npm run migrate
```

## ✅ Verification

### Check Database Connection

```powershell
# Test connection
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "SELECT version();"
```

Should return PostgreSQL version without errors.

### Check Tables

```powershell
# List tables
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "\dt"
```

After migration, you should see 8 tables.

## 🐛 Troubleshooting

### Error: "password authentication failed"

**Cause**: Password mismatch between `.env` and docker-compose.yml or container was created with different password.

**Solution**: Recreate container (see Option 1 above).

### Error: "database does not exist"

**Cause**: Database wasn't created.

**Solution**: 
```powershell
docker exec -it safelink-postgres psql -U safelink -d postgres -c "CREATE DATABASE safelink_africa;"
```

### Error: "connection refused"

**Cause**: PostgreSQL container not running.

**Solution**:
```powershell
docker-compose ps
docker-compose up -d postgres
```

### Container Keeps Restarting

**Cause**: Configuration error or port conflict.

**Solution**:
```powershell
# Check logs
docker-compose logs postgres

# Check if port 5432 is in use
netstat -ano | findstr :5432
```

## 📋 Default Credentials

For development:
- **User**: `safelink`
- **Password**: `safelink_dev_password`
- **Database**: `safelink_africa`
- **Port**: `5432`

**⚠️ WARNING**: Change these in production!

## 🎯 Complete Setup Sequence

```powershell
# 1. Ensure Docker Desktop is running
docker --version

# 2. Create .env file (if not exists)
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    # Or create manually with DB_PASSWORD=safelink_dev_password
}

# 3. Start PostgreSQL
docker-compose up -d postgres

# 4. Wait for it to start
Start-Sleep -Seconds 15

# 5. Verify connection
docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT 1;"

# 6. Run migration
npm run migrate

# 7. Verify tables created
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "\dt"
```

---

**Need Help?** Run: `powershell -ExecutionPolicy Bypass -File scripts/fix-database-password.ps1`

