# Restaurant Menu Management Platform

A production-grade restaurant administration system and customer-facing digital menu engine built with Next.js, NestJS, PostgreSQL, Prisma, and S3-compatible object storage (MinIO).

## Overview

The **Restaurant Menu Management** platform empowers hospitality operators, culinary teams, and multi-concept restaurant groups to design, schedule, customize, and publish digital menus in real-time. Guests access live menus via table QR codes on their mobile devices with instant dietary filtering, allergen warnings, and custom dish modifier calculations.

## Features

- **Multi-Tenant Restaurant Administration**: Dedicated operator accounts, slug management (e.g. `/m/bistro-parisien`), and localization options (multi-currency support).
- **Multi-Menu Architectures & Schedules**: Manage distinct menus (Breakfast, Lunch, Dinner, Weekend Brunch) with automated time windows (`07:00` - `11:30`) and active day filters.
- **Hierarchical Categories & Organization**: Structure menus into sortable culinary sections (Antipasti, Wood-Fired Mains, Desserts, Cocktails).
- **Dish Engineering & 86 Availability Toggle**: Full dish attributes, calories, preparation details, promotional pricing, and instant "86'd" (sold out) toggle.
- **Variant Modifiers & Dynamic Pricing**: Support modifier groups (e.g., choice of protein, crust type, size) with positive or negative price deltas.
- **Dietary & Allergen Transparency**: Explicit tags for Vegetarian, Vegan, Gluten-Free, and Spicy, alongside allergen disclosures.
- **Instant Vector QR Menu Generator**: On-demand SVG and PNG QR codes with optional table seating parameters (`?table=12`) for frictionless table-side scanning.
- **Responsive Mobile Guest Menu**: Ultra-fast mobile web experience with category tabs, dish search, and interactive modifier previews.

## Architecture & Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: NestJS 10, TypeScript, Passport.js, JWT, Helmet, Throttler
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Object Storage**: S3-compatible object store (MinIO containerized)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (optional for local PostgreSQL and MinIO)

### Environment Configuration

Copy `.env.example` to `.env` in both `backend` and `frontend` folders:

```bash
# In backend/
PORT=4002
DATABASE_URL="postgresql://tradeo_user:tradeo_secure_pass@localhost:5434/restaurant_menu_db?schema=public"
JWT_SECRET="super-secret-restaurant-jwt-key"
FRONTEND_URL="http://localhost:3002"
S3_ENDPOINT="localhost"
S3_PORT=9000
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="restaurant-menus"

# In frontend/
NEXT_PUBLIC_API_URL="http://localhost:4002/api/v1"
PORT=3002
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

To start PostgreSQL and MinIO:

```bash
docker-compose up -d postgres minio
```

Run database migrations:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Development Servers

```bash
# Backend (port 4002)
cd backend
npm run start:dev

# Frontend (port 3002)
cd frontend
npm run dev
```

Visit `http://localhost:3002` for the operator dashboard, or `http://localhost:3002/m/trattoria-bella` for the guest digital menu.

## Automated Testing Suite

The application includes unit tests, integration tests, API verification, and multi-tenant security isolation tests:

```bash
cd backend
npm test
```

## API Documentation

When the backend is running, explore interactive Swagger API documentation at:
`http://localhost:4002/docs`
