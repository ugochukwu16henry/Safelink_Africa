# Fix Database Password Script
# This script helps resolve password authentication issues

Write-Host "SafeLink Africa - Database Password Fix" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    if (-not (Test-Path ".env")) {
        Write-Host "ERROR: .env.example not found. Creating default .env..." -ForegroundColor Red
        $envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safelink_africa
DB_USER=safelink
DB_PASSWORD=safelink_dev_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev_jwt_secret_change_in_production
NODE_ENV=development
"@
        $envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
        Write-Host "SUCCESS: Created .env file" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS: Created .env file from template" -ForegroundColor Green
    }
}

# Check if PostgreSQL container exists
Write-Host "Checking PostgreSQL container..." -ForegroundColor Cyan
$container = docker ps -a --filter "name=safelink-postgres" --format "{{.Names}}" 2>&1

if ($container -and $container -ne "") {
    Write-Host "WARNING: PostgreSQL container exists but may have wrong password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Recreate container with correct password (RECOMMENDED)"
    Write-Host "2. Try connecting with default password"
    Write-Host ""
    
    $choice = Read-Host "Choose option (1 or 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "Recreating PostgreSQL container..." -ForegroundColor Cyan
        docker-compose down postgres 2>&1 | Out-Null
        docker volume rm safelink-africa_postgres_data -ErrorAction SilentlyContinue 2>&1 | Out-Null
        docker-compose up -d postgres
        
        Write-Host "Waiting for PostgreSQL to start (15 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        Write-Host "SUCCESS: Container recreated. Try running 'npm run migrate' again" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Testing connection..." -ForegroundColor Cyan
        $testResult = docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Connection successful!" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Connection failed. Please recreate the container (option 1)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "INFO: PostgreSQL container not found. Starting it..." -ForegroundColor Yellow
    docker-compose up -d postgres
    
    Write-Host "Waiting for PostgreSQL to start (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    Write-Host "SUCCESS: Container started. Try running 'npm run migrate' again" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Ensure .env file has: DB_PASSWORD=safelink_dev_password"
Write-Host "2. Run: npm run migrate"
Write-Host "3. If still failing, recreate container:"
Write-Host "   docker-compose down"
Write-Host "   docker volume rm safelink-africa_postgres_data"
Write-Host "   docker-compose up -d postgres"
