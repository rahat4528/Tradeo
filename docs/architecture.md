# Architecture Overview

## Monorepo with Autonomous Micro-Applications

Tradeo is structured as a curated repository of 13 independent, enterprise-grade business applications. Unlike traditional monorepos that share internal libraries, utilities, or shared databases, Tradeo enforces **strict architectural isolation**:

1. **Independent Lifecycle**: Each application folder (`01-url-shortener`, `02-code-snippet-manager`, etc.) is fully self-contained with its own dependencies, TypeScript configuration, testing suites, build scripts, and execution runtime.
2. **Dedicated Datastores**: Each application possesses its own dedicated database and cache instances. No schema, table, or cache namespace is shared across applications.
3. **Decoupled Contracts**: Applications interact exclusively through well-defined, versioned external HTTP/REST APIs, WebSockets, or independent message brokers when required.

## Directory Layout Pattern

Every sub-project follows a standardized, production-ready directory blueprint:

```
NN-project-name/
├── backend/               # NestJS or Node.js REST API service
│   ├── src/
│   │   ├── modules/       # Domain-driven feature modules (controllers, services, repositories)
│   │   ├── common/        # Filters, interceptors, guards, decorators, middleware
│   │   ├── config/        # Environment and typed configuration
│   │   └── main.ts        # Bootstrap entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # Next.js or React user interface
│   ├── src/
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # Reusable UI components, modals, inputs
│   │   ├── lib/           # API clients, state management, utilities
│   │   └── styles/        # Tailored design system styling
│   ├── package.json
│   └── tsconfig.json
├── database/              # Schema definitions, seed scripts, migration runner
│   ├── schema.prisma      # Prisma ORM schema
│   ├── migrations/        # Version-controlled SQL migrations
│   └── seed.ts            # Realistic seed fixtures
├── tests/                 # Comprehensive test suites
│   ├── unit/              # Unit tests for domain logic and utilities
│   ├── integration/       # Database and service integration tests
│   ├── api/               # End-to-end REST API contract tests
│   └── security/          # Auth, sanitization, rate-limiting & vulnerability tests
├── docs/                  # Technical documentation and completion reports
│   └── completion-report.md
├── docker-compose.yml     # Standalone Docker composition for the project
├── .env.example           # Documented template environment configuration
└── README.md              # Complete setup, testing, and operational guide
```

## Security & Reliability Standards

- **Authentication & Authorization**: Industry-standard JWT tokens with secure HTTP-only cookies or bearer authorization, role-based access control (RBAC), and bcrypt password hashing.
- **Validation**: Strict runtime validation of all inbound payloads using `class-validator` and `zod` schemas.
- **Resilience**: Centralized exception filters, structured logging, transaction management, and health checks.
