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

## Step 6 — Mobile app shell ✅

**Done:**

- [x] React Native (Expo SDK 51) with TypeScript
- [x] Design tokens: `mobile/src/theme/colors.ts` (Safe Teal, Amber, SOS Red, sky, ink, snow)
- [x] Bottom tabs: Home, SOS, Profile
- [x] **HomeScreen** — welcome, quick actions list
- [x] **SOSScreen** — one-tap SOS button; calls Emergency API `POST /emergency/trigger` (localhost:4002)
- [x] **ProfileScreen** — placeholder for account and trusted contacts
- [x] Run: `cd mobile && npm install && npx expo start` — then scan QR with Expo Go or run on simulator

**Note:** On a physical device, set `EMERGENCY_API` in SOSScreen to your machine’s IP (e.g. `http://192.168.1.x:4002`) so the app can reach the Emergency service.

---

## Step 7 — Auth: register + login with JWT ✅

**Done:**

- [x] Auth store: in-memory users, password hashing (scrypt), find by email/id
- [x] **POST /auth/register** — body: `{ email, password, name }` → returns `{ user, token }` (201); 409 if email in use
- [x] **POST /auth/login** — body: `{ email, password }` → returns `{ user, token }` (200); 401 if invalid
- [x] **GET /auth/me** — header `Authorization: Bearer <token>` → returns `{ user }` (200); 401 if invalid/expired
- [x] JWT signing with `JWT_SECRET` (env or dev default); optional `JWT_EXPIRES_IN` (default 7d)
- [x] Auth middleware for protected routes
- [x] Tests: register, login, GET /auth/me, duplicate email (409), wrong password (401)
- [x] Run: `cd services/auth && npm run build && npm test`

---

## Step 8 — Wire mobile to Auth ✅

**Done:**

- [x] **AuthContext** — user, token, login, register, logout; token + user persisted with AsyncStorage
- [x] **API config** — `mobile/src/config/api.ts` (AUTH_API, EMERGENCY_API)
- [x] **LoginScreen** — email, password; calls POST /auth/login; stores token and user
- [x] **RegisterScreen** — name, email, password (min 6); calls POST /auth/register; stores token and user
- [x] **App flow** — if no user: show Auth stack (Login / Register); if user: show Main tabs (Home, SOS, Profile)
- [x] **SOSScreen** — uses `user?.id` for Emergency trigger; shows “anonymous” hint when not signed in
- [x] **ProfileScreen** — shows signed-in user (email, name) and Log out
- [x] Dependencies: `@react-navigation/native-stack`, `@react-native-async-storage/async-storage`

**Next:** Reporting service or real device location for SOS.

---

### How to run and test (on your machine)

1. **Prerequisites:** Node.js 18+ installed.
2. **Install:** From repo root run `npm install` (installs workspace packages).
3. **Build auth service:** `cd services/auth && npm run build`
4. **Test auth health:** `npm test` (starts server, hits `/health`, exits).
5. **Run auth service:** `npm run dev` — then open http://localhost:4001/health  
6. **Build & test emergency:** `cd services/emergency && npm run build && npm test`  
7. **Run emergency service:** `npm run dev` — then open http://localhost:4002/health  
8. **Run admin web app:** From repo root run `npm install`, then `cd web && npm run dev` — then open http://localhost:3000

**If you see "next is not recognized" or TAR_ENTRY_ERROR:** The web app now uses a launcher (`web/run-next.js`) that finds Next from root or web. If install was corrupted, from repo root run: `Remove-Item -Recurse -Force node_modules; npm install`, then `cd web && npm run dev`.

9. **Run mobile app:** `cd mobile && npm install && npx expo start` — then open in Expo Go (scan QR) or simulator.

---

*Last updated: Step 7 — Auth register/login/JWT and GET /auth/me.*
