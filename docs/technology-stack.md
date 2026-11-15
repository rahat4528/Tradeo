# Technology Stack Matrix

The applications in Tradeo are built on modern, resilient, typed technologies tailored to their domain requirements while adhering to unified production standards.

## Core Technologies

| Category | Primary Technologies | Purpose & Rationale |
|---|---|---|
| **Backend Framework** | NestJS, Express, Node.js | Scalable modular architecture, strong dependency injection, typed decorators |
| **Frontend Framework** | Next.js (App Router), React 19 / 18 | High-performance server and client components, optimized asset delivery |
| **Language** | TypeScript (Strict mode) | End-to-end type safety, reliable refactoring, high developer velocity |
| **Database & ORM** | PostgreSQL, Prisma ORM | ACID compliance, declarative schemas, automated migrations, type-safe queries |
| **Caching & Queues** | Redis | Low-latency key-value caching, rate limiting, background job queuing |
| **Styling & Design** | Tailwind CSS, Lucide Icons | Responsive, accessible, custom visual identities for each application domain |
| **Realtime** | Socket.IO, WebSockets | Bidirectional event streaming for collaboration and live dashboards |
| **Testing** | Jest, Supertest, Vitest | Multi-tier automated testing: unit, integration, API, and security suites |
| **Containerization** | Docker, Docker Compose | Isolated multi-container environments per application |

## Project-Specific Technology Breakdown

1. **01-url-shortener**: Next.js, NestJS, PostgreSQL, Prisma, Redis, QRCode, Nanoid
2. **02-code-snippet-manager**: Next.js, NestJS, PostgreSQL, Prisma, Monaco Editor / CodeMirror
3. **03-restaurant-menu-management**: Next.js, NestJS, PostgreSQL, Prisma, MinIO / S3 Storage
4. **04-task-management-app**: Next.js, NestJS, PostgreSQL, Prisma, Redis Worker
5. **05-inventory-management-system**: Next.js, NestJS, PostgreSQL, Prisma, Redis Worker, Barcode Engine
6. **06-calendar-scheduling-app**: Next.js, NestJS, PostgreSQL, Prisma, Redis Scheduler
7. **07-crm-application**: Next.js, NestJS, PostgreSQL, Prisma, Redis Worker
8. **08-api-testing-tool**: Next.js, Node.js / Express, PostgreSQL, Monaco Editor, Axios Runner
9. **09-trello-clone**: Next.js, NestJS, PostgreSQL, Prisma, Socket.IO, dnd-kit
10. **10-notion-clone**: Next.js, NestJS, PostgreSQL, Prisma, Tiptap Editor
11. **11-jira-clone**: Next.js, NestJS, PostgreSQL, Prisma, Redis Real-Time Bus
12. **12-kanban-board**: React, NestJS, PostgreSQL, Prisma, dnd-kit (WIP constraints)
13. **13-devops-dashboard**: React/Next.js, Node.js, PostgreSQL, Prometheus Engine, Metrics Aggregator
