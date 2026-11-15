# 05 - Inventory Management System (StockMaster)

A high-reliability, multi-facility inventory tracking and supply chain platform. Built with **Next.js 14**, **NestJS 10**, **PostgreSQL**, **Prisma ORM**, and **Redis**.

StockMaster provides end-to-end stock control across distributed warehouses, real-time Weighted Average Cost (WAC) valuation, automated low-stock reorder triggers, inter-warehouse transfers, supplier procurement workflows, and an immutable stock movement audit ledger.

---

## 1. Features

- **Multi-Warehouse Architecture**: Segregate inventory by physical facility, fulfillment hub, or retail outlet with independent stock levels per SKU.
- **Product & SKU Catalog**: Comprehensive product definitions with SKU codes, barcodes/UPC, categories, unit-of-measure, cost price, and selling price.
- **Immutable Stock Movement Ledger**: Every stock addition, deduction, transfer, damage scrap, and cycle-count adjustment is permanently journaled with user attribution, timestamp, and audit reference.
- **Inter-Warehouse Stock Transfers**: Two-phase relocation that validates source availability, executes atomic deduction, and increments destination stock.
- **Automated Reorder & Low-Stock Alerts**: Continuous evaluation against minimum safety buffers and target inventory targets.
- **Supplier & Procurement Management**: Manage vendor directories, lead times, purchase orders (POs), line items, and automated goods receiving directly into warehouse stock.
- **Reporting & Analytics**: Real-time total inventory valuation (WAC), SKU health indicators, warehouse capacity utilization, and CSV data export/import.
- **Multi-Tenant Security**: Strict tenant isolation across organizations, warehouses, and inventory records.

---

## 2. Technology Stack & Ports

| Component | Technology | Dedicated Port |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide Icons | `3004` |
| **Backend** | NestJS 10, TypeScript, Passport JWT, Swagger OpenAPI | `4004` |
| **Database** | PostgreSQL 16 with Prisma ORM | `5436` |
| **Cache** | Redis 7 Alpine | `6381` |

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
- Frontend: [http://localhost:3004](http://localhost:3004)
- Backend: [http://localhost:4004](http://localhost:4004)
- Swagger API Docs: [http://localhost:4004/api/docs](http://localhost:4004/api/docs)

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
- **Unit Tests**: Weighted average cost valuation, stock math, reorder threshold triggers.
- **Integration Tests**: Product SKU management, warehouse stock adjustments, inter-facility transfer logic.
- **API Tests**: Enterprise registration, JWT authentication, supplier PO procurement.
- **Security Tests**: Organization boundary and tenant isolation validation.
