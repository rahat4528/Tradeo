# 06 - Calendar Scheduling App (TimeSync)

A high-performance, availability-driven calendar booking and scheduling coordinator. Built with **Next.js 14**, **NestJS 10**, **PostgreSQL**, **Prisma ORM**, and **Redis**.

TimeSync enables hosts to publish customized event types, establish granular weekly availability windows, block holidays with date overrides, enforce buffer times before and after appointments, and provide double-booking-proof public booking pages with real-time timezone conversion.

---

## 1. Features

- **Custom Event Types**: Define bookable meeting templates with custom durations (15m, 30m, 45m, 60m+), location formats (Google Meet, Zoom, Phone, In-person), custom slugs, and descriptions.
- **Dynamic Slot Availability Engine**: Real-time slot computation that combines host weekly working hours, date overrides, confirmed bookings, and buffer times.
- **Strict Double-Booking & Collision Prevention**: Mathematical collision detection prevents race conditions and overbooking.
- **Timezone Normalization**: UTC-grounded database persistence with client-side detection and multi-timezone conversion.
- **Buffer Times & Minimum Notice**: Enforce custom resting periods (`bufferBefore`, `bufferAfter`) and prevent last-minute surprise bookings (`minNoticeHours`).
- **Public Friction-Free Booking URLs**: Clean, branded public booking pages (`/book/{username}/{event-slug}`) without requiring invitee account creation.
- **Self-Service Rescheduling & Cancellation**: Dedicated secure public token links (`/booking/{uid}`) allowing invitees to reschedule or cancel bookings.
- **Host Administration Console**: Manage event types, review confirmed and past appointments, update weekly schedules, and add holiday date overrides.

---

## 2. Technology Stack & Ports

| Component | Technology | Dedicated Port |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide Icons | `3005` |
| **Backend** | NestJS 10, TypeScript, Passport JWT, Swagger OpenAPI | `4005` |
| **Database** | PostgreSQL 16 with Prisma ORM | `5437` |
| **Cache** | Redis 7 Alpine | `6382` |

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
- Frontend: [http://localhost:3005](http://localhost:3005)
- Backend: [http://localhost:4005](http://localhost:4005)
- Swagger API Docs: [http://localhost:4005/api/docs](http://localhost:4005/api/docs)

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
- **Unit Tests**: Buffer time math, overlap collision detection, timezone normalization.
- **Integration Tests**: Weekly schedule updates, date overrides, event type slug uniqueness.
- **API Tests**: Host registration, slot calculation, booking creation, double-booking rejection, UID cancellation.
- **Security Tests**: Host privacy isolation and booking authorization guards.
