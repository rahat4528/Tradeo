# 11 - Jira Clone

> Agile project workspace and issue tracker featuring multi-project management, sprint planning, backlog grooming, customizable workflow states, and story point estimation.

---

## 1. Overview & Capabilities

**Jira Clone** is an enterprise-grade agile project workbench tailored for high-velocity software engineering, product, and QA organizations. It unifies backlog prioritization, sprint lifecycle orchestration (planning, active execution, completion with unfinished issue rollovers), multi-column scrum boards, story point velocity tracking, and issue detail collaboration into an integrated workspace.

---

## 2. Key Features

- **Multi-Project Workspaces**:
  - Independent project workspaces with customizable keys (e.g., `ENG`, `PROJ`).
  - Auto-generated sequential issue keys (`<PROJECT_KEY>-<INDEX>`).
- **Comprehensive Issue Taxonomies**:
  - Issue types: `EPIC`, `STORY`, `TASK`, and `BUG`.
  - Granular priority matrix: `HIGHEST`, `HIGH`, `MEDIUM`, `LOW`, and `LOWEST`.
  - Story point sizing and capacity planning.
- **Sprint Lifecycle Management**:
  - Iteration planning with sprint goal, start date, and end date.
  - Strict sprint concurrency rules (single active sprint per project).
  - Sprint completion engine automatically rolling unfinished issues to the project backlog.
- **Interactive Active Sprint Board**:
  - Visual status columns mapped to project workflow states (`TODO`, `IN_PROGRESS`, `DONE`).
  - Drag-and-drop status transitions with optimistic UI synchronization.
  - Filter by issue type, priority, assignee, or full-text search.
- **Backlog & Sprint Grooming**:
  - Unified backlog view with quick move-to-sprint actions.
  - Capacity calculation displaying total story points per sprint.
- **Collaboration & Auditing**:
  - Timestamped comment stream with author attribution.
  - Subtask relationships and parent epic linkages.

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios
- **Backend**: NestJS, Node.js 20, TypeScript, Passport JWT, Class Validator, ioredis
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Cache**: Redis 7
- **Containerization**: Docker, Docker Compose

---

## 4. Port Allocation Matrix

| Service | Host Port | Internal Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `3010` | `3010` | Next.js Agile Workbench UI |
| **Backend API** | `4010` | `4010` | NestJS RESTful API Service |
| **PostgreSQL** | `5442` | `5432` | Dedicated Relational Database |
| **Redis** | `6384` | `6379` | Dedicated In-Memory Cache |

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ or Docker
- Redis 7+ or Docker

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
# Backend runs at http://localhost:4010
```

### Step 4: Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:3010
```

---

## 6. Docker Compose Deployment

To build and run the entire self-contained application stack with Docker:

```bash
docker-compose up --build -d
```

- Web Application: `http://localhost:3010`
- Backend API Docs / Health: `http://localhost:4010/api/health`

---

## 7. Automated Testing Suite

The project includes unit, integration, API, and project security test suites:

```bash
cd backend
npm test
```

### Test Coverage Breakdown
- `tests/unit/key-generator.spec.ts`: Unit tests verifying project key formatting and sequential counter generation.
- `tests/unit/velocity-calculator.spec.ts`: Unit tests verifying sprint capacity, completed story points, and completion rate calculations.
- `tests/integration/sprint-lifecycle.spec.ts`: Integration tests for sprint creation, starting concurrency validation, and completion issue rollover.
- `tests/integration/issues.service.spec.ts`: Integration tests for issue creation, key generation, and backlog querying.
- `tests/api/auth.api.spec.ts`: End-to-end API verification for user registration, starter project setup, and JWT issuance.
- `tests/api/projects.api.spec.ts`: API verification for project provisioning and workflow states.
- `tests/security/project-isolation.spec.ts`: Security tests verifying strict cross-tenant isolation and unauthorized access prevention.
