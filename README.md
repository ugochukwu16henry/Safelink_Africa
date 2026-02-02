# SafeLink Africa

**A continent-wide safety ecosystem for Africa** — connecting individuals, families, transport users, communities, and emergency responders.

## Mission

<<<<<<< HEAD
## 👤 Founder & Owner

**Henry Maobughichi Ugochukwu** - Founder, Owner & Creator of SafeLink Africa

SafeLink Africa was conceived and created by Henry Maobughichi Ugochukwu with the vision of making Africa a safer place through innovative technology solutions.

## 🎯 Vision
=======
SafeLink Africa gives people across Africa fast, reliable ways to get help and stay safe: one-tap SOS, community reporting, safe transport tracking, and women & family safety — all in one trusted platform.
>>>>>>> 75461f9f54e23f0bd985aa69bc7c4cdc169a9734

## What We're Building

| Module | Description |
|--------|-------------|
| **Emergency Alert** | One-tap SOS, live video/audio, auto location, panic timer, offline SMS/USSD fallback |
| **Community Safety** | Report incidents with photos/video, anonymous option, community moderators |
| **Safe Transport** | Trip tracking, unexpected stop alerts, driver verification, share trip with trusted contacts |
| **Women & Family Safety** | Hidden emergency trigger, safe walk map, silent reporting |
| **Smart Home (IoT)** | Door/window sensors, motion, camera integrations, push alerts |
| **Admin Dashboard** | Manage reports, alerts, users, heat maps, analytics |

## Repository Structure

<<<<<<< HEAD
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
docker-compose up -d postgres redis

# Wait 20 seconds for PostgreSQL to initialize
# Then run migrations
npm run migrate

# If migration fails with password error, run:
npm run reset:db
# Then try migrate again

# Start development servers
npm run dev
=======
```
Safelink_Africa/
├── docs/           # Architecture, design system, API, build log
├── shared/         # Shared types, utils, design tokens
├── services/       # Backend microservices (auth, emergency, reporting, etc.)
├── web/            # Admin dashboard (Next.js 14, Tailwind, design system)
├── mobile/         # Mobile app (Expo / React Native) — Home, SOS, Profile
└── README.md
>>>>>>> 75461f9f54e23f0bd985aa69bc7c4cdc169a9734
```

## Tech Stack

- **Mobile:** React Native (Android & iOS)
- **Backend:** Node.js + TypeScript, microservices
- **Real-time:** Socket.IO / WebRTC
- **Database:** PostgreSQL
- **Admin:** React / Next.js
- **Security:** AES-256, RSA-2048, JWT, encrypted streams

## Getting Started

<<<<<<< HEAD
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
- [API Testing Guide](./API_TESTING.md) - How to test all APIs
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
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
=======
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, [docs/API.md](docs/API.md) for the Emergency and Auth APIs, and [docs/BUILD_LOG.md](docs/BUILD_LOG.md) for the step-by-step build log.
>>>>>>> 75461f9f54e23f0bd985aa69bc7c4cdc169a9734

---

*Building safety for Africa, step by step.*
