# Tradeo — Code Snippet Manager

A developer-focused workspace to store, organize, version, and rapidly retrieve code snippets with syntax highlighting, Monaco Editor integration, hierarchical folders, tagging, and revision history.

---

## 1. Overview & Core Purpose

The **Code Snippet Manager** offers software engineers an isolated personal library to preserve reusable code patterns, algorithms, shell scripts, and configuration templates. Featuring a high-density 3-pane workstation, the app delivers full-text search across raw code and descriptions, seamless language syntax highlighting for over 30 languages, automated version history snapshots on every edit, and one-click JSON backup export and import.

---

## 2. Feature Matrix

- **Developer Authentication & Workspace Isolation**: Multi-tenant architecture with JWT tokens, bcrypt password hashing, and isolated user workspaces.
- **Monaco Editor Integration**: Native desktop-class editing experience powered by Monaco Editor (line numbers, bracket matching, minimap, multi-cursor, and tab settings).
- **Multi-Language Highlighting**: Syntax support for TypeScript, JavaScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, SQL, HTML, CSS, Markdown, Shell, YAML, JSON, Dockerfile, and GraphQL.
- **Hierarchical Folders**: Create, rename, nest, and delete organizational folders. Moving a folder preserves or reassigns child snippets automatically.
- **Dynamic Tagging System**: Tag snippets with multi-category labels (`#react`, `#auth`, `#algorithms`) with instant tag-based filtering.
- **Faceted Full-Text Search**: Sub-millisecond query evaluation searching titles, markdown descriptions, tags, and raw code content.
- **Automated Version History**: Every modification to code content automatically archives an immutable revision snapshot with custom author summaries.
- **One-Click Rollback**: Inspect past revisions side-by-side and restore any historical snapshot with a single click.
- **Productivity Ergonomics**: One-click code copying to clipboard with confirmation, favorite bookmarking, and markdown usage notes.
- **Backup Export & Import**: Export full workspace libraries as structured JSON and bulk import external snippets.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Monaco Editor (`@monaco-editor/react`), Tailwind CSS, Lucide React
- **Backend API**: NestJS 10, TypeScript, Express, Passport JWT, Class Validator, Swagger OpenAPI, Throttler
- **Database**: PostgreSQL 16 with Prisma ORM
- **Containerization**: Docker & Docker Compose

---

## 4. Architecture & Data Model

```
                +-------------------------+
                |    Next.js Frontend     |
                |   (Port 3001 / Client)  |
                +------------+------------+
                             | REST / JSON
                             v
                +-------------------------+
                |     NestJS REST API     |
                |   (Port 4001 / Backend) |
                +------------+------------+
                             | Prisma ORM
                             v
                    +------------------+
                    |    PostgreSQL    |
                    |   (Port 5433)    |
                    +------------------+
```

### Database Schema Models
- **User**: Authentication credentials, user name, and workspace ownership.
- **Folder**: Hierarchical folder trees with `parentId` self-referential relations.
- **Snippet**: Title, markdown notes, language identifier, code payload, favorite status, public visibility, and folder binding.
- **Tag**: User-scoped unique tags linked to snippets via `SnippetTag`.
- **SnippetVersion**: Immutable historical revision snapshots (`versionNumber`, `code`, `language`, `title`, `summary`, `createdAt`).

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js v20+ or v24+
- npm v10+
- (Optional) Docker and Docker Compose

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Backend Setup & Startup
```bash
cd backend
npm install
npx prisma generate --schema=../database/schema.prisma
npx prisma migrate deploy --schema=../database/schema.prisma
npm run start:dev
```
Backend will start on `http://localhost:4001`. Swagger documentation: `http://localhost:4001/api/docs`.

### 3. Frontend Setup & Startup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3001`.

---

## 6. Docker Deployment

Launch the isolated stack (PostgreSQL database on port 5433, NestJS backend on port 4001, Next.js frontend on port 3001):
```bash
docker compose up --build -d
```
To bring down containers:
```bash
docker compose down
```

---

## 7. Database Migrations, Seeding & Backup

### Migrations
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
  docker compose exec postgres pg_dump -U tradeo_user code_snippets_db > backup.sql
  ```
- **Restore**:
  ```bash
  docker compose exec -T postgres psql -U tradeo_user -d code_snippets_db < backup.sql
  ```

---

## 8. Automated Testing

All automated tests are contained within `tests/` and execute without external dependencies:

```bash
cd backend
npm run test            # Execute all test suites
npm run test:unit       # Unit tests
npm run test:integration# Service integration tests
npm run test:api        # REST API contract tests
npm run test:security   # Workspace authorization tests
```
