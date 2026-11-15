# 07 - CRM Application (NexusCRM)

A comprehensive B2B customer relationship management and sales pipeline acceleration platform. Built with **Next.js 14**, **NestJS 10**, **PostgreSQL**, **Prisma ORM**, and **Redis**.

NexusCRM delivers full sales lifecycle management: enterprise account directories, stakeholder contact tracking, multi-stage visual sales pipelines, deal probability weighting, chronological interaction histories (calls, meetings, notes, emails), follow-up task reminders, and automated revenue forecasting.

---

## 1. Features

- **Multi-Stage Sales Pipeline**: Visual deal Kanban funnel (`LEAD` &rarr; `QUALIFIED` &rarr; `PROPOSAL` &rarr; `NEGOTIATION` &rarr; `CLOSED_WON` / `CLOSED_LOST`) with quick stage advancement.
- **Automated Revenue Forecasting**: Calculates active pipeline totals and probability-weighted revenue projections on the fly.
- **Enterprise Company Accounts**: Tiered categorization (`ENTERPRISE`, `MID_MARKET`, `SMB`), annual revenue tracking, industry tagging, and domain lookup.
- **Stakeholder & Contact Directory**: Associate contacts with client companies, track job titles, direct phone/email, and lead source attribution.
- **Chronological Interaction Timeline**: Journal customer phone calls, sales demos/meetings, written notes, and correspondence logs.
- **Follow-Up Task Reminders**: Action item tracking linked to specific deals with due dates, priority tiers, and one-click completion toggles.
- **Role-Based Access Control (RBAC)**: Distinct Manager and Sales Representative permissions.
- **Multi-Tenant Security**: Rigorous organization-level data isolation across accounts, deals, and activities.

---

## 2. Technology Stack & Ports

| Component | Technology | Dedicated Port |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide Icons | `3006` |
| **Backend** | NestJS 10, TypeScript, Passport JWT, Swagger OpenAPI | `4006` |
| **Database** | PostgreSQL 16 with Prisma ORM | `5438` |
| **Cache** | Redis 7 Alpine | `6383` |

---

## 3. Deployment Status

- **GitHub Repository**: [https://github.com/rahat4528/Tradeo](https://github.com/rahat4528/Tradeo)
- **Frontend Hosting (Vercel)**: **Not Deployed** (Deployable via `npm run build` on Vercel)
- **Backend Hosting (Render)**: **Not Deployed** (Deployable via Docker / Web Service on Render)
- **Local Environment**: Fully supported via Docker Compose (`docker-compose.yml`)

---

## 4. Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or Docker)
- Redis 7 (or Docker)

### Option A: Running with Docker Compose

```bash
docker-compose up -d
```
- Frontend: [http://localhost:3006](http://localhost:3006)
- Backend: [http://localhost:4006](http://localhost:4006)
- Swagger API Docs: [http://localhost:4006/api/docs](http://localhost:4006/api/docs)

### Option B: Running Locally

1. **Start Database and Redis**:
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Setup Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate --schema=../database/schema.prisma
   npx prisma migrate deploy --schema=../database/schema.prisma
   npm run start:dev
   ```

4. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 5. Automated Tests

```bash
cd backend
npm test
```
Suite includes:
- **Unit Tests**: Weighted pipeline revenue math, win rate calculation, stage probability mapping.
- **Integration Tests**: Deal stage progression, pipeline grouping, company directory queries.
- **API Tests**: CRM workspace registration, JWT authentication, activity logging, task completion.
- **Security Tests**: Multi-tenant organization isolation and cross-company tampering protection.
