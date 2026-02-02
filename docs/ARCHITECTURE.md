# SafeLink Africa — System Architecture

## Overview

SafeLink Africa is a **distributed microservices** system with:

- **Mobile app** (React Native) for end users
- **Backend services** (Node.js/TypeScript) for auth, emergency, reporting, transport, notifications, IoT
- **Admin web app** (React/Next.js) for organizations and moderators
- **Real-time engine** (Socket.IO / WebRTC) for live alerts and streaming
- **Encrypted database** (PostgreSQL) for persistence

## High-Level Diagram

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│   Mobile App    │────▶│              API Gateway                  │
│  (React Native) │     │         (future / single entry)           │
└─────────────────┘     └──────────────────────────────────────────┘
         │                                    │
         │                                    ▼
         │              ┌─────────────────────────────────────────┐
         │              │  Microservices                           │
         │              │  • auth    • emergency  • reporting     │
         └─────────────▶│  • transport • notifications • iot      │
                        └─────────────────────────────────────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        ▼                ▼                ▼
                 ┌──────────┐    ┌────────────┐   ┌──────────┐
                 │PostgreSQL│    │ Socket.IO   │   │  Redis   │
                 │   (DB)   │    │ (real-time) │   │ (cache)  │
                 └──────────┘    └────────────┘   └──────────┘
```

## Core Services

| Service | Responsibility | Port |
|---------|----------------|------|
| **auth** | User registration, login, JWT, trusted contacts, device verification | 4001 |
| **emergency** | SOS trigger, location updates, alert status; POST /emergency/trigger, /location, GET /emergency/:id | 4002 |
| **reporting** | Community incident reports, evidence storage, moderator workflow |
| **transport** | Trip start/end, location during trip, unexpected stop alerts |
| **notifications** | Push, SMS fallback, in-app alerts |
| **iot** | MQTT/sensor events, device registration, alarm push |

## Security

- **Encryption:** AES-256 for sensitive data, RSA-2048 for key exchange
- **Transport:** HTTPS, secure WebRTC for streams
- **Auth:** JWT with refresh, optional OAuth for partners
- **Privacy:** User-controlled trusted contacts, optional anonymous reporting, auto-delete options

## Documentation

- [DESIGN.md](DESIGN.md) — Design system and colors
- [API.md](API.md) — Emergency and Auth API reference
- [BUILD_LOG.md](BUILD_LOG.md) — Step-by-step build and test log
