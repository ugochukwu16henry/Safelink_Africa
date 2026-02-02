# SafeLink Africa - Setup Checker
# Checks if everything is ready for API testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeLink Africa - Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check 1: Docker Desktop
Write-Host "1. Checking Docker Desktop..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   PASS: Docker is installed" -ForegroundColor Green
    } else {
        $issues += "Docker Desktop is not running or not installed"
        Write-Host "   FAIL: Docker Desktop not running" -ForegroundColor Red
    }
} catch {
    $issues += "Docker Desktop is not installed"
    Write-Host "   FAIL: Docker not found" -ForegroundColor Red
}

# Check 2: PostgreSQL Container
Write-Host ""
Write-Host "2. Checking PostgreSQL container..." -ForegroundColor Cyan
try {
    $postgres = docker ps --filter "name=safelink-postgres" --format "{{.Names}}" 2>&1
    if ($postgres -and $postgres -eq "safelink-postgres") {
        Write-Host "   PASS: PostgreSQL container is running" -ForegroundColor Green
        
        # Test connection
        $test = docker exec safelink-postgres psql -U safelink -d safelink_africa -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   PASS: Database connection works" -ForegroundColor Green
        } else {
            $issues += "Cannot connect to PostgreSQL database"
            Write-Host "   FAIL: Cannot connect to database" -ForegroundColor Red
        }
    } else {
        $issues += "PostgreSQL container is not running"
        Write-Host "   FAIL: PostgreSQL container not running" -ForegroundColor Red
        Write-Host "   Fix: docker-compose up -d postgres" -ForegroundColor Yellow
    }
} catch {
    $issues += "Cannot check PostgreSQL container"
    Write-Host "   FAIL: Error checking container" -ForegroundColor Red
}

# Check 3: Database Tables
Write-Host ""
Write-Host "3. Checking database tables..." -ForegroundColor Cyan
try {
    $tables = docker exec safelink-postgres psql -U safelink -d safelink_africa -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $tableCount = [int]($tables -replace '\s', '')
        if ($tableCount -ge 7) {
            Write-Host "   PASS: Database tables exist ($tableCount tables)" -ForegroundColor Green
        } else {
            $warnings += "Database migration may not be complete (only $tableCount tables found)"
            Write-Host "   WARN: Only $tableCount tables found (expected 7+)" -ForegroundColor Yellow
            Write-Host "   Fix: npm run migrate" -ForegroundColor Yellow
        }
    } else {
        $warnings += "Cannot check database tables"
        Write-Host "   WARN: Cannot check tables" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Error checking database tables"
    Write-Host "   WARN: Error checking tables" -ForegroundColor Yellow
}

# Check 4: Redis Container
Write-Host ""
Write-Host "4. Checking Redis container..." -ForegroundColor Cyan
try {
    $redis = docker ps --filter "name=safelink-redis" --format "{{.Names}}" 2>&1
    if ($redis -and $redis -eq "safelink-redis") {
        Write-Host "   PASS: Redis container is running" -ForegroundColor Green
    } else {
        $warnings += "Redis container is not running (some features may not work)"
        Write-Host "   WARN: Redis container not running" -ForegroundColor Yellow
        Write-Host "   Fix: docker-compose up -d redis" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Cannot check Redis container"
    Write-Host "   WARN: Error checking Redis" -ForegroundColor Yellow
}

# Check 5: Backend Services
Write-Host ""
Write-Host "5. Checking backend services..." -ForegroundColor Cyan
$services = @(
    @{Port=3001; Name="Auth Service"; Script="dev:auth"},
    @{Port=3002; Name="Emergency Service"; Script="dev:emergency"},
    @{Port=3003; Name="Reporting Service"; Script="dev:reporting"},
    @{Port=3004; Name="Transport Service"; Script="dev:transport"},
    @{Port=3005; Name="Notifications Service"; Script="dev:notifications"}
)

$runningServices = 0
foreach ($service in $services) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($service.Port)/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "   PASS: $($service.Name) (port $($service.Port))" -ForegroundColor Green
        $runningServices++
    } catch {
        $issues += "$($service.Name) is not running"
        Write-Host "   FAIL: $($service.Name) (port $($service.Port))" -ForegroundColor Red
        Write-Host "         Fix: npm run $($service.Script)" -ForegroundColor Yellow
    }
}

# Check 6: .env file
Write-Host ""
Write-Host "6. Checking .env file..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "   PASS: .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("DB_PASSWORD", "JWT_SECRET")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Host "   PASS: Required environment variables found" -ForegroundColor Green
    } else {
        $warnings += "Missing environment variables: $($missingVars -join ', ')"
        Write-Host "   WARN: Missing variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    }
} else {
    $warnings += ".env file not found"
    Write-Host "   WARN: .env file not found" -ForegroundColor Yellow
    Write-Host "   Fix: Copy .env.example to .env or run: npm run reset:db" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "SUCCESS: Everything is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "  - Test APIs: npm run test:api" -ForegroundColor White
    Write-Host "  - Verify setup: npm run verify" -ForegroundColor White
    exit 0
} else {
    if ($issues.Count -gt 0) {
        Write-Host "CRITICAL ISSUES ($($issues.Count)):" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Quick Fixes:" -ForegroundColor Cyan
    Write-Host "  1. Start Docker Desktop" -ForegroundColor White
    Write-Host "  2. Start database: docker-compose up -d postgres redis" -ForegroundColor White
    Write-Host "  3. Run migration: npm run migrate" -ForegroundColor White
    Write-Host "  4. Start services: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run automated fix: npm run reset:db" -ForegroundColor Yellow
    
    exit 1
}

