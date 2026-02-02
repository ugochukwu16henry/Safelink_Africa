# Quick Database Fix - Recreates PostgreSQL container with correct password

Write-Host "Quick Database Fix" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""

# Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = "DB_HOST=localhost`nDB_PORT=5432`nDB_NAME=safelink_africa`nDB_USER=safelink`nDB_PASSWORD=safelink_dev_password`nREDIS_HOST=localhost`nREDIS_PORT=6379`nJWT_SECRET=dev_jwt_secret_change_in_production`nNODE_ENV=development"
    Set-Content -Path ".env" -Value $envContent
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host "Stopping PostgreSQL container..." -ForegroundColor Yellow
docker-compose stop postgres 2>&1 | Out-Null

Write-Host "Removing PostgreSQL container..." -ForegroundColor Yellow
docker-compose rm -f postgres 2>&1 | Out-Null

Write-Host "Removing database volume..." -ForegroundColor Yellow
docker volume rm safelink-africa_postgres_data -ErrorAction SilentlyContinue 2>&1 | Out-Null

Write-Host "Starting PostgreSQL with correct password..." -ForegroundColor Yellow
docker-compose up -d postgres

Write-Host "Waiting for PostgreSQL to initialize (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "Testing connection..." -ForegroundColor Cyan
$test = docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now run: npm run migrate" -ForegroundColor Cyan
} else {
    Write-Host "WARNING: Connection test failed. Wait a bit longer and try again." -ForegroundColor Yellow
    Write-Host "Run: npm run migrate" -ForegroundColor Cyan
}

