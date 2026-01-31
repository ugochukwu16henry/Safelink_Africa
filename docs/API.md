# SafeLink Africa — API Reference

## Emergency Service (port 4002)

Base URL: `http://localhost:4002` (development).

### Health

- **GET /health** — Service health check.
  - Response: `{ status: "ok", service: "emergency", timestamp: "<ISO>" }`

### Emergency alerts

- **GET /emergency** — List all alerts (newest first).
  - Response (200): `{ alerts: Array<{ id, userId, status, latitude, longitude, triggeredAt, resolvedAt? }> }`

- **POST /emergency/trigger** — Create a new emergency alert (one-tap SOS).
  - Body: `{ userId: string, latitude: number, longitude: number }`
  - Response (201): `{ id, userId, status: "active", latitude, longitude, triggeredAt }`
  - Errors: 400 if body invalid.

- **POST /emergency/location** — Append location for an active alert.
  - Body: `{ alertId: string, latitude: number, longitude: number }`
  - Response (200): `{ ok: true }`
  - Errors: 400 if body invalid; 404 if alert not found or not active.

- **GET /emergency/:id** — Get alert and latest location.
  - Response (200): `{ alert: { id, userId, status, latitude, longitude, triggeredAt, resolvedAt? }, latestLocation: { alertId, latitude, longitude, timestamp } | null }`
  - Errors: 404 if alert not found.

---

## Auth Service (port 4001)

Base URL: `http://localhost:4001` (development).

### Health

- **GET /health** — Health check. Response: `{ status: "ok", service: "auth", timestamp: "<ISO>" }`
- **GET /** — Service info.

### Auth

- **POST /auth/register** — Create account.
  - Body: `{ email: string, password: string, name: string }` (password min 6 chars)
  - Response (201): `{ user: { id, email, name, role }, token, expiresIn }`
  - Errors: 400 if body invalid or password too short; 409 if email already in use.

- **POST /auth/login** — Sign in.
  - Body: `{ email: string, password: string }`
  - Response (200): `{ user: { id, email, name, role }, token, expiresIn }`
  - Errors: 400 if body invalid; 401 if invalid email or password.

- **GET /auth/me** — Current user (requires Bearer token).
  - Header: `Authorization: Bearer <token>`
  - Response (200): `{ user: { id, email, name, role } }`
  - Errors: 401 if missing/invalid/expired token.

---

*More endpoints (reporting, transport) will be added as services are built.*
