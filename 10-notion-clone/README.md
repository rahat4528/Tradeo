# 10 - Notion Clone

> All-in-one block-based workspace and collaborative document editor featuring nested hierarchical page trees, modular content blocks, real-time search, and Markdown / HTML export.

---

## 1. Overview & Capabilities

**Notion Clone** is a modular documentation and knowledge workspace built for modern individuals and cross-functional teams. It replaces rigid static text editors with a dynamic block-based canvas where documents are assembled from granular, draggable, and convertible building blocks: headings, rich text paragraphs, checklist to-dos, syntax-highlighted code blocks, quotes, callout alerts, and structural dividers. Documents are structured in infinite nested page hierarchies with instant sub-page navigation, fast indexed search, and full export capabilities.

---

## 2. Key Features

- **Block-Based Document Canvas**:
  - Modular block architecture with inline block type selectors.
  - Supported block primitives: `PARAGRAPH`, `HEADING_1`, `HEADING_2`, `HEADING_3`, `TODO`, `CODE`, `QUOTE`, `DIVIDER`, and `CALLOUT`.
  - Rich metadata support: checked status for to-dos, programming languages for code blocks, and custom callout icons.
- **Hierarchical Nested Pages**:
  - Unlimited recursive parent-child page hierarchies.
  - Page tree sidebar navigation with collapsible folder branches.
  - Page icons (emojis), custom cover banners, and breadcrumb navigation.
- **Instant Full-Text Search**:
  - Workspace-wide search indexing page titles and block body contents.
  - Quick keyboard-driven navigation (`Cmd/Ctrl + K` style search modal).
- **Export Engine**:
  - Export document trees to clean GitHub-flavored Markdown (`.md`).
  - Export documents to standalone styled HTML (`.html`).
- **Workspace Isolation & Multi-Tenancy**:
  - Strict tenant boundary isolation ensuring users access only their authorized workspaces.
  - JWT authentication and bcrypt password encryption.

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: NestJS, Node.js 20, TypeScript, Passport JWT, Class Validator
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Containerization**: Docker, Docker Compose

---

## 4. Port Allocation Matrix

| Service | Host Port | Internal Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `3009` | `3009` | Next.js Block Workspace UI |
| **Backend API** | `4009` | `4009` | NestJS RESTful API Service |
| **PostgreSQL** | `5441` | `5432` | Dedicated Relational Database |

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
# Backend runs at http://localhost:4009
```

### Step 4: Run Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:3009
```

---

## 6. Docker Compose Deployment

To build and run the entire self-contained application stack with Docker:

```bash
docker-compose up --build -d
```

- Web Application: `http://localhost:3009`
- Backend API Docs / Health: `http://localhost:4009/api/health`

---

## 7. Automated Testing Suite

The project includes unit, integration, API, and workspace security test suites:

```bash
cd backend
npm test
```

### Test Coverage Breakdown
- `tests/unit/markdown-converter.spec.ts`: Unit tests verifying block-to-markdown serialization.
- `tests/unit/page-tree-builder.spec.ts`: Unit tests verifying recursive hierarchy and breadcrumb generation.
- `tests/integration/pages.service.spec.ts`: Integration tests for page creation, retrieval, and nesting.
- `tests/integration/blocks.service.spec.ts`: Integration tests for block manipulation and reordering.
- `tests/api/auth.api.spec.ts`: End-to-end API verification for registration and JWT issuance.
- `tests/api/search.api.spec.ts`: Search API tests verifying full-text query filtering.
- `tests/security/workspace-isolation.spec.ts`: Security tests verifying strict cross-tenant isolation.
