# Bug Fixes Applied

## Bug 1: PostgreSQL Password Mismatch ✅ FIXED

### Problem
- `docker-compose.yml` line 8 had hardcoded `POSTGRES_PASSWORD: safelink_dev_password`
- Backend services (lines 47, 75, 105, 130, 182) use `${DB_PASSWORD:-safelink_dev_password}` 
- If developers set `DB_PASSWORD` in `.env`, PostgreSQL container would ignore it
- This caused authentication failures when backend services tried to connect

### Fix Applied
Changed line 8 in `docker-compose.yml`:
```yaml
# Before:
POSTGRES_PASSWORD: safelink_dev_password

# After:
POSTGRES_PASSWORD: ${DB_PASSWORD:-safelink_dev_password}
```

Now PostgreSQL container reads from `.env` file, matching all backend services.

### Additional Fix: Duplicate Script
- Removed duplicate `install:mobile` script entry (was on lines 12 and 14)
- Kept single entry on line 12

## Bug 2: Incorrect PowerShell Script Execution ✅ FIXED

### Problem
- `package.json` line 32 had: `"test:api": "node scripts/test-api.ps1 || bash scripts/test-api.sh"`
- PowerShell scripts (`.ps1`) cannot be executed with `node` command
- This would always fail on Windows

### Fix Applied
Changed line 32 in `package.json`:
```json
// Before:
"test:api": "node scripts/test-api.ps1 || bash scripts/test-api.sh"

// After:
"test:api": "powershell -ExecutionPolicy Bypass -File scripts/test-api.ps1 2>$null || bash scripts/test-api.sh"
```

Now uses the same pattern as other PowerShell scripts (lines 28-30), with error suppression for cross-platform compatibility.

## Verification

Both bugs are now fixed:
- ✅ PostgreSQL password now reads from environment variable
- ✅ All services use consistent password source
- ✅ Duplicate script removed
- ✅ PowerShell script execution fixed

## Impact

- **Before**: Developers setting custom `DB_PASSWORD` in `.env` would get authentication failures
- **After**: Custom passwords in `.env` work correctly across all services
- **Before**: `npm run test:api` would fail on Windows
- **After**: `npm run test:api` works on both Windows and Unix systems

