# 09 - Trello Clone

> Real-time visual project management and task board application featuring boards, lists, draggable cards, checklists, activity logs, and multi-user collaboration.

---

## 1. Overview & Capabilities

**Trello Clone** is a visual collaboration workbench designed for cross-functional product, engineering, and business teams. It enables structuring workflows into boards, customizable lists, and rich cards. Cards feature color labels, multi-item checklists with progress tracking, due date monitoring, comments, and full audit logs. Changes synchronize across all connected clients via Socket.IO WebSocket broadcasts.

---

## 2. Key Features

- **Board & Workspace Organization**:
  - Workspaces grouping related projects.
  - Custom background color themes.
  - Granular collaborator roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **Dynamic Lists & Workflow Columns**:
  - Add, rename, reorder, and archive lists.
  - Floating fractional position indices ensuring smooth ordering.
- **Card Lifecycle & Drag-and-Drop**:
  - Native HTML5 drag-and-drop movement across columns and within lists.
  - Optimistic client-side UI updating with server synchronization.
- **Checklists & Subtasks**:
  - Multi-checklist support per card.
  - Interactive checkboxes with real-time percentage completion indicators.
- **Labels & Taxonomies**:
  - Categorization chips (`Feature`, `Bug`, `Urgent`, `Enhancement`, `Documentation`).
- **Activity & Comments Log**:
  - Granular audit trail capturing card creation, movements across lists, and discussions.
- **Real-Time Collaboration**:
  - Socket.IO gateway with room-based pub/sub broadcasting (`board:<id>`).

---

## 3. Technology Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Socket.IO Client
- **Backend**: NestJS, Node.js 20, TypeScript, Socket.IO WebSocket Gateway, Passport JWT
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Containerization**: Docker, Docker Compose

---

## 4. Port Allocation Matrix

| Service | Host Port | Internal Container Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `3008` | `3008` | Next.js Visual Board UI |
| **Backend API / WS**| `4008` | `4008` | NestJS REST & WebSocket Service |
| **PostgreSQL** | `5440` | `5432` | Dedicated Relational Database |

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
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Step 3: Run Backend Service
```bash
cd backend
npm run start:dev
```
Backend API will be accessible at `http://localhost:4008/api/v1` and WebSocket at `ws://localhost:4008`.

### Step 4: Run Frontend Workbench
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3008` in your browser.

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
All 7 test suites cover position calculators, checklist progress, board permissions, list management, and card lifecycle operations.
