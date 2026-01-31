# SafeLink Africa — Build Log

Step-by-step build and test log. We build in small steps and test as we go.

---

## Step 1 — Project structure and documentation (Current)

**Goal:** Define repo layout, design system, and architecture so all later work is consistent.

**Done:**

- [x] Created `README.md` with mission, modules, and repo structure
- [x] Created `docs/ARCHITECTURE.md` with high-level system diagram and service list
- [x] Created `docs/DESIGN.md` with color palette (Safe Teal, Amber, SOS Red, neutrals), typography, and spacing
- [x] Created `docs/BUILD_LOG.md` (this file)

**Next:** Add shared types and design tokens, then implement Auth service with health check and tests.

---

## Step 2 — Shared types and design tokens ✅

**Done:**

- [x] `shared/types/index.ts` — User, TrustedContact, EmergencyAlert, CommunityReport, TransportTrip
- [x] `shared/design-tokens.ts` — colors, spacing, borderRadius, fontSize (Safe Teal, Amber, SOS Red, etc.)
- [x] `shared/index.ts` — re-exports
- [x] `shared/package.json` and `shared/tsconfig.json`

---

## Step 3 — Auth service (health check + tests) ✅

**Done:**

- [x] Auth service: Express app, CORS, JSON, `/health` and `/` routes
- [x] `services/auth/src/index.ts` and `services/auth/src/routes/health.ts`
- [x] Integration test: spawn server, GET `/health`, assert status 200 and `body.status === 'ok'`
- [x] Test run: build auth, then `npm test` in services/auth

---

## Step 4 — Emergency service ✅

**Done:**

- [x] Emergency service: Express app, CORS, JSON
- [x] `POST /emergency/trigger` — body: `{ userId, latitude, longitude }` → creates alert, returns `{ id, status, triggeredAt, ... }`
- [x] `POST /emergency/location` — body: `{ alertId, latitude, longitude }` → appends location for active alert
- [x] `GET /emergency/:id` — returns alert + latest location
- [x] In-memory store (`src/store.ts`) — alerts + location logs (ready to swap for PostgreSQL)
- [x] Integration tests: health, trigger, location, GET alert, validation (400 for bad trigger)
- [x] Run: `cd services/emergency && npm run build && npm test`

**Next:** Admin web app shell with design system.

---

## Step 5 — Admin web app shell ✅

**Done:**

- [x] Next.js 14 (App Router) with TypeScript and Tailwind
- [x] Design system: Tailwind theme extended with Safe Teal, Amber, SOS Red, ink, sky, snow, etc. (see `web/tailwind.config.ts` and `web/app/globals.css`)
- [x] Layout: header nav (Safe Teal), main content area
- [x] Pages: Dashboard (`/`), Emergency Alerts (`/alerts`), Community Reports (`/reports`)
- [x] Dashboard cards with accent borders; quick links to Auth and Emergency health
- [x] Run: `cd web && npm install && npm run dev` — then open http://localhost:3000

**Next:** Mobile app shell (React Native) with design tokens and core screens.

---

## Step 6 — (Planned) Mobile app shell

- React Native project with design tokens
- Core screens: Home, SOS, Profile

---

### How to run and test (on your machine)

1. **Prerequisites:** Node.js 18+ installed.
2. **Install:** From repo root run `npm install` (installs workspace packages).
3. **Build auth service:** `cd services/auth && npm run build`
4. **Test auth health:** `npm test` (starts server, hits `/health`, exits).
5. **Run auth service:** `npm run dev` — then open http://localhost:4001/health  
6. **Build & test emergency:** `cd services/emergency && npm run build && npm test`  
7. **Run emergency service:** `npm run dev` — then open http://localhost:4002/health  
8. **Run admin web app:** `cd web && npm install && npm run dev` — then open http://localhost:3000

---

*Last updated: Step 5 — Admin web app shell (Next.js, design system, Dashboard, Alerts, Reports).*
