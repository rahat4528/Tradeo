# Tradeo — URL Shortener

An enterprise-grade, high-performance link management platform and redirection engine built with Next.js, NestJS, PostgreSQL, Prisma, and Redis.

---

## 1. Overview & Core Purpose

The **URL Shortener** provides a complete end-to-end suite for converting long web addresses into branded, manageable short links. Built with clean architecture and strict TypeScript, the application handles sub-millisecond cached redirects, real-time analytics aggregation, custom branded domains, encrypted password gates, and customizable vector QR code generation.

---

## 2. Feature Matrix

- **Authentication & Profiles**: Secure user registration, login, and JWT bearer authentication with bcrypt password hashing.
- **High-Speed Link Shortening**: Automatic collision-resistant short slug generation using cryptographic nanoid algorithms.
- **Custom Branded Aliases**: User-defined vanity slugs (e.g. `/product-launch-2026`) with collision checks and reserved namespace guards.
- **Flexible HTTP Redirects**: Support for HTTP `301 Moved Permanently`, `302 Found`, `307 Temporary Redirect` (default), and `308 Permanent Redirect`.
- **Vector & Raster QR Codes**: High-resolution PNG and scalable vector SVG QR code generation with custom error-correction levels and resolution choices.
- **Deep Telemetry & Click Tracking**: Asynchronous tracking of total/unique clicks, geographic origins, referrers, operating systems, browsers, and device platforms.
- **Interactive Analytics Dashboard**: Filterable timeline activity charts (24h, 7d, 30d, all-time) and metric breakdowns.
- **Link Expiration Rules**: Configurable expiration timestamps with automatic HTTP 410 (Gone) status enforcement.
- **Privacy & Password Protection**: Optional password locks for links with interactive challenge screens.
- **Custom Domains**: Register and bind custom hostnames and subdomains with default fallback URL routing.
- **Abuse & Phishing Prevention**: Target URL sanitization, blocklist checks, self-referencing loop prevention, and token-bucket rate limiting.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend API**: NestJS 10, TypeScript, Express, Passport JWT, Throttler, Class Validator, Swagger OpenAPI
- **Database**: PostgreSQL 16 with Prisma ORM
- **Cache & Memory**: Redis 7 with automatic high-performance in-memory Map fallback
- **Containerization**: Docker & Docker Compose

---

## 4. Architecture & Data Model

```
                +-------------------------+
                |    Next.js Frontend     |
                |   (Port 3000 / Client)  |
                +------------+------------+
                             | REST / HTTP
                             v
                +-------------------------+
                |     NestJS REST API     |
                |   (Port 4000 / Backend) |
                +------+------------+-----+
                       |            |
         Cache Check   v            v  Persistent Storage
          +----------------+    +-------------------+
          |     Redis      |    |    PostgreSQL     |
          |  (Port 6379)   |    |    (Port 5432)    |
          +----------------+    +-------------------+
```

### Database Schema Models
- **User**: Authentication credentials, roles, and profile metadata.
- **Domain**: Registered custom domains and verification status.
- **Link**: Slug, destination target, status, expiration, password hash, and redirect code.
- **Click**: Anonymized IP hash, timestamp, country, referrer, browser, OS, and device.
- **ApiKey**: Programmatic access tokens for external integrations.

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js v20+ or v24+
- npm v10+
- (Optional) Docker and Docker Compose

### 1. Environment Setup
Copy the environment template in the project root:
```bash
cp .env.example .env
```

### 2. Backend Installation & Startup
```bash
cd backend
npm install
npx prisma generate --schema=../database/schema.prisma
npx prisma migrate deploy --schema=../database/schema.prisma
npm run start:dev
```
Backend will start on `http://localhost:4000`. Swagger documentation is available at `http://localhost:4000/api/docs`.

### 3. Frontend Installation & Startup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 6. Docker Deployment

To launch the entire isolated stack (PostgreSQL, Redis, NestJS backend, Next.js frontend):
```bash
docker compose up --build -d
```
To shut down containers and preserve data volumes:
```bash
docker compose down
```

---

## 7. Database Migrations, Seeding & Backup

### Running Migrations
```bash
cd backend
npx prisma migrate dev --name init --schema=../database/schema.prisma
```

### Seeding Test Fixtures
```bash
cd backend
npm run prisma:seed
```

### Backup & Recovery
- **Backup**:
  ```bash
  docker compose exec postgres pg_dump -U tradeo_user url_shortener_db > backup.sql
  ```
- **Restore**:
  ```bash
  docker compose exec -T postgres psql -U tradeo_user -d url_shortener_db < backup.sql
  ```

---

## 8. Automated Testing

All test suites are self-contained inside `tests/` and run without external dependencies:

```bash
cd backend
npm run test            # Run all suites
npm run test:unit       # Unit tests
npm run test:integration# Service integration tests
npm run test:api        # REST API contract tests
npm run test:security   # Security and abuse prevention tests
```
