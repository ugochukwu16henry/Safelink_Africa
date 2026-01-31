# SafeLink Africa — API Reference

## Emergency Service (port 4002)

Base URL: `http://localhost:4002` (development).

### Health

- **GET /health** — Service health check.
  - Response: `{ status: "ok", service: "emergency", timestamp: "<ISO>" }`

### Emergency alerts

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

- **GET /health** — Health check. Response: `{ status: "ok", service: "auth", timestamp: "<ISO>" }`
- **GET /** — Service info.

---

*More endpoints (auth login/register, reporting, transport) will be added as services are built.*
