# SafeLink Africa API Documentation

## Base URL
- Development: `http://localhost:3001-3006`
- Production: `https://api.safelinkafrica.com`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Services

### Auth Service (Port 3001)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/emergency-contacts` - Add emergency contact

### Emergency Service (Port 3002)
- `POST /api/emergency/trigger` - Trigger SOS alert
- `GET /api/emergency/:id` - Get emergency details
- `POST /api/emergency/:id/cancel` - Cancel emergency
- `GET /api/emergency/history` - Get emergency history

### Reporting Service (Port 3003)
- `POST /api/reports` - Create incident report
- `GET /api/reports` - Get reports
- `GET /api/reports/nearby` - Get nearby reports
- `GET /api/reports/:id` - Get report details
- `PUT /api/reports/:id/status` - Update report status (admin)

### Transport Service (Port 3004)
- `POST /api/transport/trips` - Start trip
- `POST /api/transport/trips/:id/location` - Update trip location
- `POST /api/transport/trips/:id/end` - End trip
- `GET /api/transport/trips/:id` - Get trip details
- `GET /api/transport/trips` - Get trip history

### Notifications Service (Port 3005)
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

