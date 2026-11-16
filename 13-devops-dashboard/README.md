# DevOps Dashboard (Tradeo Phase 13)

A high-performance, full-stack infrastructure observability and incident response dashboard for engineering teams. Monitors real-time service health, captures multi-dimensional system telemetry (CPU, memory, request rates, latency, error percentages), automatically evaluates threshold rules to trigger incidents, aggregates application logs, and tracks CI/CD deployments across environments.

---

## 1. Features

- **Real-Time Infrastructure Monitoring**: Track multi-cluster service health (Healthy, Degraded, Down) with live uptime SLA percentages and ping heartbeats.
- **Metric Telemetry & Visualization**: Continuous timeseries tracking for CPU usage, memory allocation, request rates (RPS), roundtrip latency (ms), and error rates with responsive visual trend graphs.
- **Automated Incident Response**: Threshold-driven alert evaluation (Greater Than, Less Than, Equals) automatically creating incident tickets with severity levels (`CRITICAL`, `WARNING`, `INFO`).
- **Incident Lifecycle Management**: End-to-end incident management workflows allowing on-call engineers to acknowledge incidents, review triggers, and resolve with post-mortem notes.
- **Centralized Log Aggregation**: Multi-tenant stream viewer with real-time level filtering (`INFO`, `WARN`, `ERROR`, `DEBUG`), free-text search, and formatted terminal outputs.
- **CI/CD Deployment Tracker**: Comprehensive release tracking capturing Git commit SHAs, release versions, deployment status (`SUCCESS`, `FAILED`, `IN_PROGRESS`), duration, and deployer identity.
- **Tenant Isolation**: Secure role-based access control where engineers manage isolated infrastructure workspaces with scoped alerts and incidents.

---

## 2. Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Axios.
- **Backend**: NestJS, TypeScript, JWT Authentication, Class Validator, Passport.
- **Database**: PostgreSQL 16, Prisma ORM 5.
- **Containerization**: Docker, Docker Compose.
- **Testing**: Jest, Supertest, ts-jest.

---

## 3. Project Structure

```
13-devops-dashboard/
├── backend/
│   ├── src/
│   │   ├── common/             # Interceptors, decorators, and global filters
│   │   ├── config/             # Environment configuration module
│   │   ├── database/           # Prisma service integration
│   │   ├── modules/            # Auth, Services, Metrics, Alerts, Incidents, Deployments, Logs
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.prisma           # Prisma schema for User, Service, Metric, Alert, Incident, Deployment, Log
│   └── seed.ts                 # Database seeding script
├── docs/
│   ├── requirements.md
│   ├── api-specification.md
│   └── completion-report.md
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router (Dashboard, Incidents, Deployments, Logs, Login, Register)
│   │   ├── components/         # Sidebar, Modals, Metric Charts
│   │   └── lib/                # API client, auth context, utilities
│   ├── package.json
│   └── tsconfig.json
├── tests/                      # Unit, Integration, API, and Security test suites
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Port Allocation

- **Frontend**: `http://localhost:3012`
- **Backend API**: `http://localhost:4012/api`
- **PostgreSQL**: `localhost:5444` (Database: `devops_db`)

---

## 5. Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL or Docker

### Setup Database & Environment
1. Copy `.env.example` to `.env` in both `backend/` and `frontend/`:
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   ```

2. Start the PostgreSQL container:
   ```bash
   docker-compose up -d postgres
   ```

3. Run migrations and seed the database:
   ```bash
   cd database
   npx prisma db push --schema=./schema.prisma
   npx ts-node seed.ts
   ```

### Start Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend API will be running at `http://localhost:4012/api`.

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3012` in your browser.

---

## 6. Running Tests

Run the complete test suite:
```bash
cd backend
npm test
```

All 7 test suites (28 tests) cover:
- Threshold evaluation & alert condition unit logic
- SLA uptime calculation unit tests
- Monitored services integration workflows
- Metric ingestion & incident trigger integration
- Authentication & tenant registration API
- Multi-tenant service isolation security policies
- Alert, incident, deployment, and log aggregation workflows

---

## 7. Deployment Status

- **GitHub Repository**: [https://github.com/rahat4528/Tradeo](https://github.com/rahat4528/Tradeo)
- **Frontend Hosting (Vercel)**: **Not Deployed**
- **Backend Hosting (Render)**: **Not Deployed**
