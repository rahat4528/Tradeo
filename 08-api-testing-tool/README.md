# 08 - API Testing Tool

> Developer-centric HTTP workbench for composing, dispatching, inspecting, and automating RESTful API requests with environment variable substitution and SSRF protection.

---

## 1. Overview & Capabilities

The **API Testing Tool** is a standalone web workbench built for backend developers, API architects, and QA engineers. It allows constructing requests with precision, inspecting complete HTTP telemetry (status codes, headers, high-resolution turnaround time, byte sizes), evaluating automated test assertions, organizing saved endpoints into hierarchical collections, managing environment variables, and safeguarding internal infrastructure via strict SSRF protection rules.

---

## 2. Key Features

- **HTTP Request Builder**:
  - Full verb support: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
  - Dynamic query parameters editor and custom HTTP headers table.
  - Request body formats: `JSON`, `RAW`, `URL_ENCODED`, and `FORM_DATA`.
  - Authentication helpers: `Bearer Token`, `Basic Auth`, and custom `API Key` (injectable into Header or Query parameters).
- **Response Inspection & Telemetry**:
  - High-precision execution turnaround time (ms) and response byte size.
  - Pretty-printed JSON viewer with syntax highlighting and raw payload inspector.
  - Response headers table and quick copy-to-clipboard functionality.
- **Environment & Variable Substitution Engine**:
  - Multi-environment configurations (e.g., `Staging`, `Production`, `Localhost`).
  - Seamless regex interpolation for tokens formatted as `{{variable_name}}` across URLs, headers, params, and body payloads.
- **Hierarchical Collections & Workspaces**:
  - Organize requests into collections and nested folders.
  - Full JSON collection import and export for collaboration.
- **Execution History**:
  - Chronological history of past request executions with status codes, latency, and payloads.
  - One-click restore to reload any past request back into the active workbench.
- **Automated Test Assertions**:
  - Built-in rule evaluations: `STATUS_EQUALS`, `RESPONSE_TIME_LT`, `JSON_BODY_CONTAINS`, and `HEADER_EQUALS`.
  - Real-time pass/fail validation badges.
- **SSRF & Network Security Protection**:
  - Prohibits unauthorized requests to loopback addresses (`127.0.0.1`, `localhost`, `::1`).
  - Blocks cloud instance metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
  - Enforces RFC 1918 private subnet protection (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) in restricted mode.

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: NestJS, Node.js 20, TypeScript, Axios HTTP client, Passport JWT
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Containerization**: Docker, Docker Compose

---

## 4. Port Allocation Matrix

| Service | Host Port | Internal Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `3007` | `3007` | Next.js API Workbench UI |
| **Backend API** | `4007` | `4007` | NestJS Dispatch Proxy Engine |
| **PostgreSQL** | `5439` | `5432` | Dedicated Relational Database |

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ or Docker

### Step 1: Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

### Step 2: Database Setup & Migrations
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Step 3: Run Backend Service
```bash
cd backend
npm run start:dev
```
Backend API will be accessible at `http://localhost:4007/api/v1` and Swagger docs at `http://localhost:4007/docs`.

### Step 4: Run Frontend Workbench
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3007` in your browser.

---

## 6. Docker Deployment

To launch the entire stack using Docker Compose:
```bash
docker compose up -d --build
```

---

## 7. Verification & Automated Testing

Run the full automated test suite:
```bash
cd backend
npm test
```
All 7 test suites cover unit assertions, variable interpolation, API authentication, collection management, proxy dispatch, and SSRF security protection.
