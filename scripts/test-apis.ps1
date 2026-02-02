# SafeLink Africa API Testing Script
# Tests all API endpoints to verify they work

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SafeLink Africa - API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BaseUrl = "http://localhost"
$AuthToken = ""
$TestResults = @()

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Test function
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Data = $null,
        [string]$Description,
        [bool]$RequiresAuth = $false
    )
    
    Write-Host -NoNewline "Testing: $Description... " -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($RequiresAuth -and $AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method Get -Headers $headers -ErrorAction Stop
        } else {
            if ($Data) {
                $body = $Data | ConvertFrom-Json
                $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body ($body | ConvertTo-Json) -ErrorAction Stop
            } else {
                $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -ErrorAction Stop
            }
        }
        
        Write-Host "PASS" -ForegroundColor Green
        $script:TestResults += @{Test=$Description; Status="PASS"}
        return $true
    } catch {
        $statusCode = "N/A"
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
        } catch {
            # Status code not available
        }
        Write-Host "FAIL (HTTP $statusCode)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:TestResults += @{Test=$Description; Status="FAIL"; Error=$_.Exception.Message}
        return $false
    }
}

# Check if services are running
Write-Host "Checking Services..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Port=3001; Name="Auth Service"},
    @{Port=3002; Name="Emergency Service"},
    @{Port=3003; Name="Reporting Service"},
    @{Port=3004; Name="Transport Service"},
    @{Port=3005; Name="Notifications Service"}
)

$allServicesRunning = $true
foreach ($service in $services) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($service.Port)/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  $($service.Name) (port $($service.Port)): " -NoNewline
        Write-Host "RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "  $($service.Name) (port $($service.Port)): " -NoNewline
        Write-Host "NOT RUNNING" -ForegroundColor Red
        Write-Host "    Start with: npm run dev:$($service.Name.ToLower().Replace(' ', ''))" -ForegroundColor Yellow
        $allServicesRunning = $false
    }
}

if (-not $allServicesRunning) {
    Write-Host ""
    Write-Host "ERROR: Some services are not running!" -ForegroundColor Red
    Write-Host "Start all services with: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Auth Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate unique phone number for testing (avoid conflicts)
$randomSuffix = Get-Random -Minimum 1000000 -Maximum 9999999
$testPhone = "+234" + $randomSuffix.ToString()

# Test Registration
$registerData = @{
    phoneNumber = $testPhone
    firstName = "Test"
    lastName = "User"
    password = "password123"
    country = "NG"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3001/api/auth/register" -Data $registerData -Description "User Registration"

# Test Login
Write-Host ""
Write-Host "Logging in to get auth token..." -ForegroundColor Yellow
$loginData = @{
    phoneNumber = $testPhone
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl:3001/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginData
    $AuthToken = $loginResponse.data.accessToken
    Write-Host "  Token obtained successfully" -ForegroundColor Green
} catch {
    Write-Host "  Failed to get token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cannot continue with authenticated tests without token." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing User Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Method "GET" -Url "$BaseUrl:3001/api/users/me" -Description "Get User Profile" -RequiresAuth $true

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Emergency Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$emergencyData = @{
    type = "security"
    latitude = 6.5244
    longitude = 3.3792
    message = "Test emergency alert"
} | ConvertTo-Json

# Trigger emergency and capture response
try {
    $emergencyResponse = Invoke-RestMethod -Uri "$BaseUrl:3002/api/emergency/trigger" -Method Post -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $AuthToken"} -Body $emergencyData -ErrorAction Stop
    $emergencyId = $emergencyResponse.data.emergency.id
    Write-Host "Testing: Trigger Emergency Alert... PASS" -ForegroundColor Green
    $script:TestResults += @{Test="Trigger Emergency Alert"; Status="PASS"}
    
    # Test getting emergency details
    Test-Endpoint -Method "GET" -Url "$BaseUrl:3002/api/emergency/$emergencyId" -Description "Get Emergency Details" -RequiresAuth $true
} catch {
    Write-Host "Testing: Trigger Emergency Alert... FAIL" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $script:TestResults += @{Test="Trigger Emergency Alert"; Status="FAIL"; Error=$_.Exception.Message}
}

Test-Endpoint -Method "GET" -Url "$BaseUrl:3002/api/emergency/history" -Description "Get Emergency History" -RequiresAuth $true

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Reporting Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$reportData = @{
    category = "crime"
    title = "Test Incident Report"
    description = "This is a test incident report for API testing"
    latitude = 6.5244
    longitude = 3.3792
    anonymous = $false
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3003/api/reports" -Data $reportData -Description "Create Incident Report" -RequiresAuth $true
Test-Endpoint -Method "GET" -Url "$BaseUrl:3003/api/reports" -Description "Get Reports" -RequiresAuth $true
Test-Endpoint -Method "GET" -Url "$BaseUrl:3003/api/reports/nearby?latitude=6.5244&longitude=3.3792&radius=5000" -Description "Get Nearby Reports" -RequiresAuth $true

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Transport Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$tripData = @{
    startLatitude = 6.5244
    startLongitude = 3.3792
    endLatitude = 6.4550
    endLongitude = 3.3941
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3004/api/transport/trips" -Data $tripData -Description "Start Trip" -RequiresAuth $true
Test-Endpoint -Method "GET" -Url "$BaseUrl:3004/api/transport/trips" -Description "Get Trip History" -RequiresAuth $true

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Notifications Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$notificationData = @{
    userId = "test-user-id"
    type = "system_notification"
    channel = "push"
    title = "Test Notification"
    message = "This is a test notification"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3005/api/notifications/send" -Data $notificationData -Description "Send Notification"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $TestResults.Count

Write-Host "Total Tests: $total" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Yellow
    $TestResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host ""

