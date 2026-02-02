# SafeLink Africa API Testing Script (PowerShell)
# Tests all API endpoints to verify they work

Write-Host "🧪 Testing SafeLink Africa APIs..." -ForegroundColor Cyan
Write-Host ""

$BaseUrl = "http://localhost"
$AuthToken = ""

# Test function
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Data = $null,
        [string]$Description
    )
    
    Write-Host -NoNewline "Testing: $Description... "
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method Get -Headers $headers -ErrorAction Stop
        } else {
            $body = $Data | ConvertFrom-Json
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body ($body | ConvertTo-Json) -ErrorAction Stop
        }
        
        Write-Host "✓ PASS" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check if services are running
Write-Host "📡 Checking if services are running..." -ForegroundColor Cyan
$services = @(
    @{Port=3001; Name="auth"},
    @{Port=3002; Name="emergency"},
    @{Port=3003; Name="reporting"},
    @{Port=3004; Name="transport"},
    @{Port=3005; Name="notifications"}
)

foreach ($service in $services) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$($service.Port)/health" -Method Get -ErrorAction Stop
        Write-Host "✓ $($service.Name) service (port $($service.Port)) is running" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($service.Name) service (port $($service.Port)) is NOT running" -ForegroundColor Red
        Write-Host "  Start it with: npm run dev:$($service.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔐 Testing Auth Service..." -ForegroundColor Cyan
Write-Host ""

# Test Registration
$registerData = @{
    phoneNumber = "+2341234567890"
    firstName = "Test"
    lastName = "User"
    password = "password123"
    country = "NG"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3001/api/auth/register" -Data $registerData -Description "User Registration"

# Login to get token
Write-Host -NoNewline "Logging in to get auth token... "
$loginData = @{
    phoneNumber = "+2341234567890"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl:3001/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginData
    $AuthToken = $loginResponse.data.accessToken
    Write-Host "✓ Token obtained" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get token" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "👤 Testing User Endpoints..." -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Url "$BaseUrl:3001/api/users/me" -Description "Get User Profile"

Write-Host ""
Write-Host "🚨 Testing Emergency Service..." -ForegroundColor Cyan
$emergencyData = @{
    type = "security"
    latitude = 6.5244
    longitude = 3.3792
    message = "Test emergency"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3002/api/emergency/trigger" -Data $emergencyData -Description "Trigger Emergency"
Test-Endpoint -Method "GET" -Url "$BaseUrl:3002/api/emergency/history" -Description "Get Emergency History"

Write-Host ""
Write-Host "📝 Testing Reporting Service..." -ForegroundColor Cyan
$reportData = @{
    category = "crime"
    title = "Test Report"
    description = "This is a test incident report"
    latitude = 6.5244
    longitude = 3.3792
    anonymous = $false
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3003/api/reports" -Data $reportData -Description "Create Incident Report"
Test-Endpoint -Method "GET" -Url "$BaseUrl:3003/api/reports" -Description "Get Reports"
Test-Endpoint -Method "GET" -Url "$BaseUrl:3003/api/reports/nearby?latitude=6.5244&longitude=3.3792&radius=5000" -Description "Get Nearby Reports"

Write-Host ""
Write-Host "🚗 Testing Transport Service..." -ForegroundColor Cyan
$tripData = @{
    startLatitude = 6.5244
    startLongitude = 3.3792
    endLatitude = 6.4550
    endLongitude = 3.3941
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3004/api/transport/trips" -Data $tripData -Description "Start Trip"
Test-Endpoint -Method "GET" -Url "$BaseUrl:3004/api/transport/trips" -Description "Get Trip History"

Write-Host ""
Write-Host "📬 Testing Notifications Service..." -ForegroundColor Cyan
$notificationData = @{
    userId = "test-user"
    type = "system_notification"
    channel = "push"
    title = "Test"
    message = "Test notification"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$BaseUrl:3005/api/notifications/send" -Data $notificationData -Description "Send Notification"

Write-Host ""
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "- All endpoints tested"
Write-Host "- Check results above for any failures"

