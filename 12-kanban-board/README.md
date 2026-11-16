# 12 - Kanban Board

> Lean process flow visualizer and work-in-progress optimization workbench featuring WIP limits, card aging metrics, horizontal swimlanes, blocker triage, and Cumulative Flow Diagrams (CFD).

---

## 1. Overview & Capabilities

**Kanban Board** is an operational process control workbench engineered for platform engineering, site reliability, infrastructure, and delivery teams. Grounded in Lean principles, the system focuses on bottleneck elimination, flow efficiency, and cycle time reduction. Teams configure explicit column Work-In-Progress (WIP) limits, establish entry/exit policies, monitor card aging across process stages, triage external blockers, and analyze cycle time trends with Cumulative Flow telemetry.

---

## 2. Key Features

- **Work-In-Progress (WIP) Limit Constraints**:
  - Per-column configurable WIP limits.
  - Real-time capacity utilization gauges and visual breach alerts.
- **Horizontal Swimlanes**:
  - Class of service swimlanes (`Expedite`, `Standard Flow`, `Technical Debt`).
  - Emergency fast-track handling for critical incidents.
- **Card Aging & Process Telemetry**:
  - Real-time tracking of days spent in the current column (`daysInColumn`).
  - Total card age elapsed from creation (`totalAgeDays`).
  - Automatic timestamping on start (`startedAt`) and completion (`completedAt`).
- **Blocker Triage & Incident Flags**:
  - Flag work items as blocked with designated blocker reasons.
  - Dedicated board-level blocked item counters and warning banners.
- **Lean Flow Analytics & Cumulative Flow Diagram (CFD)**:
  - Average Lead Time (from creation to delivery).
  - Average Cycle Time (from active work start to delivery).
  - Real-time active WIP load and stage distribution visualizer.
- **Column Policies (Definition of Done)**:
  - Documented acceptance criteria and quality gates per process stage.

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios
- **Backend**: NestJS, Node.js 20, TypeScript, Passport JWT, Class Validator
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Containerization**: Docker, Docker Compose

---

## 4. Port Allocation Matrix

| Service | Host Port | Internal Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `3011` | `3011` | Next.js Lean Kanban Flow UI |
| **Backend API** | `4011` | `4011` | NestJS RESTful API Service |
| **PostgreSQL** | `5443` | `5432` | Dedicated Relational Database |

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ or Docker

### Step 1: Environment Configuration
```bash
cp .env.example .env
```

### Step 2: Database Setup & Migrations
```bash
cd backend
npm install
npx prisma generate --schema=../database/schema.prisma
npx prisma db push --schema=../database/schema.prisma
npx ts-node ../database/seed.ts
```

### Step 3: Run Backend Service
```bash
npm run start:dev
# Backend runs at http://localhost:4011
```

### Step 4: Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:3011
```

---

## 6. Docker Compose Deployment

To build and run the entire self-contained application stack with Docker:

```bash
docker-compose up --build -d
```

- Web Application: `http://localhost:3011`
- Backend API Docs / Health: `http://localhost:4011/api/health`

---

## 7. Automated Testing Suite

The project includes unit, integration, API, and multi-tenancy security test suites:

```bash
cd backend
npm test
```

### Test Coverage Breakdown
- `tests/unit/wip-enforcer.spec.ts`: Unit tests verifying WIP limit breach detection and capacity utilization.
- `tests/unit/lead-cycle-calculator.spec.ts`: Unit tests calculating lead time (creation -> delivery) and cycle time (started -> delivery).
- `tests/integration/boards.service.spec.ts`: Integration tests for board creation, default column/swimlane provisioning, and card aging enrichment.
- `tests/integration/cards.service.spec.ts`: Integration tests for card lifecycle transitions (startedAt/completedAt) and blocker triage.
- `tests/api/auth.api.spec.ts`: End-to-end API verification for user registration, starter board setup, and JWT issuance.
- `tests/api/analytics.api.spec.ts`: API verification for board throughput and CFD distribution calculations.
- `tests/security/board-isolation.spec.ts`: Security tests verifying strict cross-tenant boundary isolation.
