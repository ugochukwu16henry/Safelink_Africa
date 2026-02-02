# API Testing Guide

## Quick Start

### Prerequisites
1. **Start all backend services:**
   ```powershell
   npm run dev
   ```
   
   Or start individually:
   ```powershell
   npm run dev:auth
   npm run dev:emergency
   npm run dev:reporting
   npm run dev:transport
   npm run dev:notifications
   ```

2. **Wait for services to be ready** (about 10-15 seconds)

### Run All API Tests

```powershell
npm run test:api
```

This will:
- ✅ Check all services are running
- ✅ Test user registration
- ✅ Test user login
- ✅ Test all authenticated endpoints
- ✅ Show summary of results

## Manual Testing

### 1. Test Auth Service

#### Register User
```powershell
$body = @{
    phoneNumber = "+2341234567890"
    firstName = "Test"
    lastName = "User"
    password = "password123"
    country = "NG"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

#### Login
```powershell
$body = @{
    phoneNumber = "+2341234567890"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
$token = $response.data.accessToken
```

### 2. Test Emergency Service

#### Trigger Emergency
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    type = "security"
    latitude = 6.5244
    longitude = 3.3792
    message = "Test emergency"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/emergency/trigger" -Method Post -Headers $headers -Body $body
```

#### Get Emergency History
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/emergency/history" -Method Get -Headers $headers
```

### 3. Test Reporting Service

#### Create Report
```powershell
$body = @{
    category = "crime"
    title = "Test Report"
    description = "Test incident report"
    latitude = 6.5244
    longitude = 3.3792
    anonymous = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/reports" -Method Post -Headers $headers -Body $body
```

#### Get Nearby Reports
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/reports/nearby?latitude=6.5244&longitude=3.3792&radius=5000" -Method Get -Headers $headers
```

### 4. Test Transport Service

#### Start Trip
```powershell
$body = @{
    startLatitude = 6.5244
    startLongitude = 3.3792
    endLatitude = 6.4550
    endLongitude = 3.3941
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/transport/trips" -Method Post -Headers $headers -Body $body
```

### 5. Test Notifications Service

#### Send Notification
```powershell
$body = @{
    userId = "test-user-id"
    type = "system_notification"
    channel = "push"
    title = "Test"
    message = "Test notification"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3005/api/notifications/send" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

## Using cURL (Alternative)

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2341234567890",
    "firstName": "Test",
    "lastName": "User",
    "password": "password123",
    "country": "NG"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2341234567890",
    "password": "password123"
  }'
```

Save the `accessToken` from the response, then use it:

### Trigger Emergency
```bash
curl -X POST http://localhost:3002/api/emergency/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "type": "security",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "message": "Test emergency"
  }'
```

## Health Checks

Test if services are running:

```powershell
# Auth Service
Invoke-RestMethod -Uri "http://localhost:3001/health"

# Emergency Service
Invoke-RestMethod -Uri "http://localhost:3002/health"

# Reporting Service
Invoke-RestMethod -Uri "http://localhost:3003/health"

# Transport Service
Invoke-RestMethod -Uri "http://localhost:3004/health"

# Notifications Service
Invoke-RestMethod -Uri "http://localhost:3005/health"
```

## Expected Responses

All successful API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-12-19T..."
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "timestamp": "2024-12-19T..."
}
```

## Troubleshooting

### Services Not Running
```powershell
# Check which services are running
docker-compose ps

# Start all services
npm run dev
```

### Connection Refused
- Make sure services are started
- Check if ports 3001-3005 are available
- Verify firewall settings

### Authentication Errors
- Make sure you're using a valid token
- Token expires after 7 days (default)
- Login again to get a new token

### Database Errors
- Make sure PostgreSQL is running: `docker-compose ps`
- Run migration if needed: `npm run migrate`

---

**For complete API documentation, see [docs/API.md](./docs/API.md)**

