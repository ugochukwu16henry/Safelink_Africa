# SafeLink Africa - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites Check
```bash
node --version  # Should be 18+
docker --version  # Should be installed
docker-compose --version  # Should be installed
```

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd safelink-africa

# Install all dependencies
npm run install:all
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (minimal for local dev)
# At minimum, set:
# - DB_PASSWORD
# - JWT_SECRET
```

### Step 3: Start Docker Desktop
**IMPORTANT**: Make sure Docker Desktop is running before proceeding!

1. Open Docker Desktop application
2. Wait for it to fully start (check system tray icon)
3. Verify: Run `docker --version` (should show version number)

### Step 4: Start Infrastructure
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be ready (10-15 seconds)
docker-compose ps
```

**Troubleshooting**: If you get "dockerDesktopLinuxEngine" error, Docker Desktop is not running. See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for help.

### Step 5: Initialize Database
```bash
# Run database migrations
npm run migrate

# Or manually:
# psql -U safelink -d safelink_africa -f scripts/init-db.sql
```

### Step 6: Start Backend Services
```bash
# Start all services in development mode
npm run dev

# Or start individually:
# npm run dev:auth      # Port 3001
# npm run dev:emergency  # Port 3002
# npm run dev:reporting  # Port 3003
# npm run dev:transport   # Port 3004
# npm run dev:notifications # Port 3005
```

### Step 7: Start Mobile App
```bash
# In a new terminal
cd mobile
npm install
npm start

# Follow Expo instructions to:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code for physical device
```

## 🧪 Test the Application

### 1. Test Auth Service
```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2341234567890",
    "firstName": "Test",
    "lastName": "User",
    "password": "password123",
    "country": "NG"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2341234567890",
    "password": "password123"
  }'
```

### 2. Test Emergency Service
```bash
# Trigger emergency (replace TOKEN with login token)
curl -X POST http://localhost:3002/api/emergency/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "type": "security",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "message": "Test emergency"
  }'
```

### 3. Test Mobile App
- Open the app in Expo
- Register a new account
- Navigate to Emergency screen
- Test SOS button (requires location permission)

## 📊 Verify Services

### Health Checks
```bash
# Auth Service
curl http://localhost:3001/health

# Emergency Service
curl http://localhost:3002/health

# Reporting Service
curl http://localhost:3003/health

# Transport Service
curl http://localhost:3004/health

# Notifications Service
curl http://localhost:3005/health
```

### Database Connection
```bash
# Connect to PostgreSQL
docker exec -it safelink-postgres psql -U safelink -d safelink_africa

# Check tables
\dt

# Check users
SELECT id, phone_number, first_name, last_name FROM users LIMIT 5;
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3001  # Replace with your port

# Kill process or change port in .env
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart services
docker-compose restart postgres
```

### Mobile App Won't Connect
- Ensure backend services are running
- Check API_BASE_URL in mobile/src/services/api.ts
- For physical device, use your computer's IP: `http://192.168.x.x:3001`
- Ensure firewall allows connections

### Redis Connection Failed
```bash
# Check Redis
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

## 📚 Next Steps

1. **Read Documentation**
   - [API Documentation](./docs/API.md)
   - [Architecture Overview](./docs/ARCHITECTURE.md)
   - [Deployment Guide](./docs/DEPLOYMENT.md)

2. **Explore Code**
   - Start with `services/auth/src/index.ts`
   - Check `mobile/App.tsx` for mobile app structure
   - Review `shared/types/index.ts` for type definitions

3. **Development**
   - Make changes to services
   - Test locally
   - Run linter: `npm run lint`
   - Write tests

## 🎯 Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d postgres redis
npm run migrate
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

### Stop All Services
```bash
docker-compose down
```

## 💡 Tips

- Use `npm run dev` for development (auto-reload)
- Check `.env` file for configuration
- Use Postman/Insomnia for API testing
- Enable Expo DevTools for mobile debugging
- Check `docs/` folder for detailed documentation

---

**Happy Coding! 🚀**

