# Task Management Platform

A production-ready personal and team task workspace built with Next.js, NestJS, PostgreSQL, Prisma, and Redis.

## Overview

The **Task Management Platform** is a high-velocity productivity application engineered for tracking individual and collaborative workloads. It provides hierarchical task decomposition, nested subtask checklists, dynamic priority classifications, flexible recurrence scheduling, deadline tracking, custom category organization, and automated productivity velocity analytics.

## Features

- **User Authentication & Profile Control**: Secure bcrypt password hashing and JWT bearer authentication.
- **Hierarchical Task & Subtask Management**: Create, update, and manage tasks with multi-level subtask checklists and automated progress percentage tracking.
- **Priority Matrix**: Classify tasks across `CRITICAL` (P1), `HIGH` (P2), `MEDIUM` (P3), and `LOW` (P4) with visual indicators.
- **Recurrence Engine**: Support for `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` intervals that automatically spawn the next scheduled occurrence when completed.
- **Category & Project Organization**: Group tasks into custom color-coded categories and project lists.
- **Flexible Filters & Quick Views**: Dedicated views for Due Today, Upcoming 7 Days, Overdue, and Completed tasks, plus instant full-text search.
- **Productivity Dashboard & Analytics**: Real-time KPI summaries including overall completion rates, 7-day velocity, overdue counts, and priority distribution.
- **Strict Multi-Tenant User Isolation**: Every task, category, and subtask is strictly constrained to its owner with full authorization guards.

## Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: NestJS 10, TypeScript, Passport.js, JWT, Helmet, Throttler
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Queue / Cache**: Redis 7 (dedicated container on port 6380)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (optional for local PostgreSQL and Redis)

### Environment Configuration

Copy `.env.example` to `.env` in both `backend` and `frontend` directories:

```bash
# backend/.env
PORT=4003
DATABASE_URL="postgresql://tradeo_user:tradeo_secure_pass@localhost:5435/task_management_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6380
JWT_SECRET=super-secret-task-management-jwt-key
FRONTEND_URL=http://localhost:3003

# frontend/.env
PORT=3003
NEXT_PUBLIC_API_URL=http://localhost:4003/api/v1
```

### Installation

```bash
# Backend dependencies
cd backend
npm install
npx prisma generate --schema=../database/schema.prisma

# Frontend dependencies
cd ../frontend
npm install
```

### Running Locally with Docker

Start PostgreSQL and Redis:

```bash
docker-compose up -d postgres redis
```

Run database migrations:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Development Servers

```bash
# Start backend (port 4003)
cd backend
npm run start:dev

# Start frontend (port 3003)
cd frontend
npm run dev
```

Visit `http://localhost:3003` to access the application dashboard.

## Automated Testing Suite

The application includes unit tests, integration tests, API verification, and security isolation tests:

```bash
cd backend
npm test
```

## API Documentation

When the backend server is running, view the interactive OpenAPI / Swagger documentation at:
`http://localhost:4003/docs`
