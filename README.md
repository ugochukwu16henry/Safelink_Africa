# SafeLink Africa 🛡️

**Your Safety. Your Community. One App.**

A Pan-African safety application providing SOS alerts, community reporting, transport monitoring, and IoT integration to protect lives across Africa.

## 👤 Founder & Owner

**Henry Maobughichi Ugochukwu** - Founder, Owner & Creator of SafeLink Africa

SafeLink Africa was conceived and created by Henry Maobughichi Ugochukwu with the vision of making Africa a safer place through innovative technology solutions.

## 🎯 Vision

To become the leading safety platform in Africa, connecting communities and protecting millions of lives through technology.

## 🏗️ Architecture

### Microservices Backend

- **Auth Service**: User authentication and authorization (JWT/OAuth)
- **Emergency Service**: SOS alerts and emergency response
- **Reporting Service**: Community incident reporting
- **Transport Service**: Vehicle tracking and monitoring
- **Notification Service**: Push notifications, SMS, USSD fallback
- **IoT Gateway**: MQTT-based IoT device integration

### Mobile Application

- **React Native** (Android priority, iOS secondary)
- Offline-first design with USSD/SMS fallback
- Real-time emergency alerts
- Community reporting dashboard

### Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (primary), Redis (caching)
- **Real-time**: Socket.IO, WebRTC
- **Mobile**: React Native, Expo
- **Security**: AES-256 encryption, end-to-end messaging
- **DevOps**: Docker, GitHub Actions, AWS/GCP
- **IoT**: MQTT protocol

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- React Native development environment

### Installation

```bash
# Clone repository
git clone https://github.com/safelinkafrica/safelink-africa.git
cd safelink-africa

# Install backend dependencies
npm install
npm run install:services

# Install mobile app dependencies (separate step due to dependency conflicts)
cd mobile
npm install --legacy-peer-deps
cd ..

# Start services with Docker Compose
docker-compose up -d

# Run migrations
npm run migrate

# Start development servers
npm run dev
```

**Note**: Backend and mobile dependencies are installed separately due to React Native/Expo dependency conflicts. See [INSTALL.md](./INSTALL.md) for detailed instructions.

## 📱 Features

### MVP (Phase 1-3)

- ✅ SOS Emergency Alerts (<3 second activation)
- ✅ Community Incident Reporting
- ✅ Transport Monitoring
- ✅ Real-time Location Sharing
- ✅ Offline USSD/SMS Support

### Future Features (Phase 4-7)

- AI Crime Prediction
- Wearable Device Integration
- Blockchain Identity Verification
- Drone Response System
- Smart Home IoT Integration

## 🌍 Pilot Countries

- Nigeria
- Kenya
- Ghana
- South Africa
- Egypt

## 📊 Project Status

**Current Phase**: Development (Months 4-9) - 40% Complete

- **Overall Progress**: 20% Complete
- **Backend Services**: ✅ 100% MVP Complete
- **Mobile App**: 🚧 70% Complete
- **Documentation**: ✅ 80% Complete

See [TODO.md](./TODO.md) for complete task list, [PROGRESS.md](./PROGRESS.md) for detailed progress tracking, and [API_STATUS.md](./API_STATUS.md) for API verification status.

## 📖 Documentation

- [About SafeLink Africa](./ABOUT.md) - Founder and company information
- [TODO List](./TODO.md) - Complete project task list
- [Progress Tracker](./PROGRESS.md) - Current status and milestones
- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Security Guidelines](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Installation Guide](./INSTALL.md)
- [Quick Start Guide](./QUICKSTART.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

Copyright © 2024 SafeLink Africa. All rights reserved.

**Founder & Owner**: Henry Maobughichi Ugochukwu

## 📞 Contact

- Website: https://safelinkafrica.com
- Email: info@safelinkafrica.com
- Support: support@safelinkafrica.com

---

**Built with ❤️ for the safety of Africa**
