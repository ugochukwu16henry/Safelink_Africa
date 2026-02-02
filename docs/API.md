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

## Reports Service (port 4003)

Base URL: `http://localhost:4003` (development).

### Health

- **GET /health** — Service health check.
  - Response: `{ status: "ok", service: "reports", timestamp: "<ISO>" }`

### Community reports

- **GET /reports** — List all reports (newest first).
  - Response (200): `{ reports: Array<{ id, reporterId?, type, description, latitude, longitude, status, createdAt, mediaUrls? }> }`

- **POST /reports** — Create a community report.
  - Body: `{ type: string, description: string, latitude: number, longitude: number, reporterId?: string, mediaUrls?: string[] }`
  - Response (201): `{ id, reporterId?, type, description, latitude, longitude, status: "pending", createdAt, mediaUrls? }`
  - Errors: 400 if body invalid.

- **GET /reports/:id** — Get one report.
  - Response (200): report object.
  - Errors: 404 if not found.

- **PATCH /reports/:id** — Update report status (admin).
  - Body: `{ status: "pending" | "reviewed" | "resolved" }`
  - Response (200): updated report object.
  - Errors: 400 if status invalid; 404 if report not found.

---

*More endpoints (transport, notifications) will be added as services are built.*
