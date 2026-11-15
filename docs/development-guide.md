# Development Guide

This guide details local setup, testing strategies, coding conventions, and operational workflows for working with the Tradeo repository.

## Prerequisites

- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Docker & Docker Compose**: Recommended for running isolated databases and cache services
- **Git**: Configured with valid local credentials

## Navigating Projects

Each project lives inside its own dedicated directory. To work on an individual project:

```bash
cd 01-url-shortener
```

### Running with Docker Compose

Every project includes a self-contained `docker-compose.yml` defining its database (e.g. PostgreSQL), cache (e.g. Redis), backend, and frontend:

```bash
# Start background services (e.g., PostgreSQL, Redis)
docker compose up -d db redis

# Or start the entire application stack
docker compose up --build
```

### Running Locally for Development

1. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma generate --schema=../database/schema.prisma
   npx prisma migrate deploy --schema=../database/schema.prisma
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## Testing Protocol

Every project provides comprehensive test coverage divided into distinct suites:

```bash
# Run all tests for a project
npm run test

# Run specific tiers
npm run test:unit
npm run test:integration
npm run test:api
npm run test:security
```

## Security & Best Practices

- **Never Commit Secrets**: Never commit `.env` files or hardcoded credentials. All services must consume variables via environment configuration with secure defaults for local development.
- **Input Sanitization**: Validate all inputs at the boundary using strong schemas.
- **Strict Linting & Types**: Ensure zero TypeScript compilation errors (`tsc --noEmit`).
