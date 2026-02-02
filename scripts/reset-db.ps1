# Reset Database - Complete reset with correct password

Write-Host "Resetting PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

# Ensure .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envLines = @(
        "DB_HOST=localhost",
        "DB_PORT=5432",
        "DB_NAME=safelink_africa",
        "DB_USER=safelink",
        "DB_PASSWORD=safelink_dev_password",
        "REDIS_HOST=localhost",
        "REDIS_PORT=6379",
        "JWT_SECRET=dev_jwt_secret_change_in_production",
        "NODE_ENV=development"
    )
    $envLines | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host "Step 1: Stopping containers..." -ForegroundColor Yellow
docker-compose stop postgres 2>&1 | Out-Null

Write-Host "Step 2: Removing containers..." -ForegroundColor Yellow
docker-compose rm -f postgres 2>&1 | Out-Null

Write-Host "Step 3: Removing database volume..." -ForegroundColor Yellow
docker volume rm safelink-africa_postgres_data -ErrorAction SilentlyContinue 2>&1 | Out-Null

Write-Host "Step 4: Starting PostgreSQL with correct password..." -ForegroundColor Yellow
docker-compose up -d postgres

Write-Host ""
Write-Host "Waiting 25 seconds for PostgreSQL to initialize..." -ForegroundColor Yellow
for ($i = 25; $i -gt 0; $i--) {
    Write-Host "  $i seconds remaining..." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Cyan
$testResult = docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Database is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now run: npm run migrate" -ForegroundColor Cyan
} else {
    Write-Host "WARNING: Connection test failed. The database may need more time." -ForegroundColor Yellow
    Write-Host "Wait 10 more seconds and try: npm run migrate" -ForegroundColor Yellow
}

