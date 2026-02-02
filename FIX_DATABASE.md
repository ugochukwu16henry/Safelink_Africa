# Fix Database Password Issue

## 🚨 Problem

You're getting: `password authentication failed for user "safelink"`

## ✅ Solution (Choose One)

### Option 1: Quick Reset (RECOMMENDED)

Run this single command:

```powershell
npm run reset:db
```

This will:
1. ✅ Create `.env` file with correct password
2. ✅ Stop and remove PostgreSQL container
3. ✅ Remove database volume (fresh start)
4. ✅ Start PostgreSQL with correct password
5. ✅ Wait for it to initialize
6. ✅ Test connection

Then run:
```powershell
npm run migrate
```

### Option 2: Manual Steps

```powershell
# 1. Stop PostgreSQL
docker-compose stop postgres

# 2. Remove container
docker-compose rm -f postgres

# 3. Remove volume (WARNING: deletes data)
docker volume rm safelink-africa_postgres_data

# 4. Start fresh
docker-compose up -d postgres

# 5. Wait 25 seconds
Start-Sleep -Seconds 25

# 6. Run migration
npm run migrate
```

### Option 3: Check .env File

Make sure `.env` file exists and has:

```
DB_PASSWORD=safelink_dev_password
```

If `.env` doesn't exist, create it:

```powershell
@"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safelink_africa
DB_USER=safelink
DB_PASSWORD=safelink_dev_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev_jwt_secret_change_in_production
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding utf8
```

## 🔍 Why This Happens

The PostgreSQL container was created with a different password than what's in your `.env` file. Docker containers remember their initial password, so we need to recreate the container.

## ✅ Verification

After running `npm run reset:db`, verify:

```powershell
# Check container is running
docker-compose ps

# Test connection
docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT 1;"
```

Should return `1` without errors.

## 🎯 Complete Sequence

```powershell
# 1. Reset database (fixes password issue)
npm run reset:db

# 2. Run migration (creates tables)
npm run migrate

# 3. Verify tables exist
docker exec -it safelink-postgres psql -U safelink -d safelink_africa -c "\dt"
```

---

**Still having issues?** Check `DATABASE_SETUP.md` for more troubleshooting.

