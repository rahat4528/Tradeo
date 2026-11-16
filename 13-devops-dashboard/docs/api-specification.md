# DevOps Dashboard REST API Specification

## Base URL
`/api`

## Authentication
Bearer token JWT header: `Authorization: Bearer <token>`

---

## 1. Authentication Endpoints
- `POST /api/auth/register` - Create DevOps account and provision starter monitoring workspace.
  - Body: `{ email, password, name }`
  - Response: `{ accessToken, user, defaultWorkspaceId }`
- `POST /api/auth/login` - Authenticate user credentials.
  - Body: `{ email, password }`
  - Response: `{ accessToken, user }`
- `GET /api/auth/me` - Current authenticated user profile.

---

## 2. Services & Health Endpoints
- `GET /api/services` - List all registered services with live health status, environment, and uptime %.
- `POST /api/services` - Register new monitored service.
  - Body: `{ name, url, environment, intervalSeconds? }`
- `GET /api/services/:id` - Get service details, historical uptime snapshots, and current metric averages.
- `PATCH /api/services/:id` - Update service configuration.
- `DELETE /api/services/:id` - Remove service from monitoring.

---

## 3. Metrics Endpoints
- `GET /api/services/:id/metrics` - Timeseries metric points (CPU, Memory, RPS, Latency, Error Rate) over duration (`1h`, `6h`, `24h`, `7d`).
- `POST /api/services/:id/metrics` - Ingest metric snapshot.
  - Body: `{ cpuPercent, memoryPercent, requestRate, latencyMs, errorRate }`
- `GET /api/metrics/summary` - Consolidated multi-service infrastructure metric overview.

---

## 4. Alert Rules & Incidents Endpoints
- `GET /api/alerts` - List configured alert rules.
- `POST /api/alerts` - Create alert rule.
  - Body: `{ serviceId, metricType, operator, threshold, severity }`
- `DELETE /api/alerts/:id` - Remove alert rule.
- `GET /api/incidents` - List all incidents with status filter (`TRIGGERED`, `ACKNOWLEDGED`, `RESOLVED`).
- `PATCH /api/incidents/:id` - Update incident state (acknowledge or resolve).
  - Body: `{ status, resolutionNotes? }`

---

## 5. Deployments Endpoints
- `GET /api/deployments` - List recent deployment history with commit SHA, deployer, and status.
- `POST /api/deployments` - Record deployment event.
  - Body: `{ serviceId, version, commitSha, environment, status }`

---

## 6. Logs Endpoints
- `GET /api/logs` - Query aggregated log events with filters (`serviceId`, `level`, `search`, `limit`).
- `POST /api/logs` - Ingest log entry.
  - Body: `{ serviceId, level, message }`

---

## 7. System Health
- `GET /api/health` - Health check status (`{ status: "ok", timestamp }`).
