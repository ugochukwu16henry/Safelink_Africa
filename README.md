# SafeLink Africa

**A continent-wide safety ecosystem for Africa** — connecting individuals, families, transport users, communities, and emergency responders.

## Mission

SafeLink Africa gives people across Africa fast, reliable ways to get help and stay safe: one-tap SOS, community reporting, safe transport tracking, and women & family safety — all in one trusted platform.

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

```
Safelink_Africa/
├── docs/           # Architecture, design system, build log
├── shared/         # Shared types, utils, design tokens
├── services/       # Backend microservices (auth, emergency, reporting, etc.)
├── web/            # Admin dashboard (React/Next.js)
├── mobile/         # Mobile app (React Native)
└── README.md
```

## Tech Stack

- **Mobile:** React Native (Android & iOS)
- **Backend:** Node.js + TypeScript, microservices
- **Real-time:** Socket.IO / WebRTC
- **Database:** PostgreSQL
- **Admin:** React / Next.js
- **Security:** AES-256, RSA-2048, JWT, encrypted streams

## Getting Started

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, [docs/API.md](docs/API.md) for the Emergency and Auth APIs, and [docs/BUILD_LOG.md](docs/BUILD_LOG.md) for the step-by-step build log.

---

*Building safety for Africa, step by step.*
