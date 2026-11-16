# Process Flow Kanban REST API Specification

## Base URL
`/api`

## Authentication
Bearer token JWT header: `Authorization: Bearer <token>`

---

## 1. Authentication Endpoints
- `POST /api/auth/register` - Create user account and starter kanban board.
  - Body: `{ email, password, name }`
  - Response: `{ accessToken, user, defaultBoardId }`
- `POST /api/auth/login` - Authenticate user credentials.
  - Body: `{ email, password }`
  - Response: `{ accessToken, user }`
- `GET /api/auth/me` - Retrieve authenticated user profile.

---

## 2. Boards Endpoints
- `GET /api/boards` - List all boards in workspace.
- `POST /api/boards` - Create new kanban board.
  - Body: `{ title, description? }`
- `GET /api/boards/:id` - Get board details with columns, swimlanes, and cards.
- `PATCH /api/boards/:id` - Update board title or settings.
- `DELETE /api/boards/:id` - Delete board.

---

## 3. Columns & Policies Endpoints
- `POST /api/boards/:boardId/columns` - Add workflow column.
  - Body: `{ title, wipLimit?, policy?, order? }`
- `PATCH /api/columns/:id` - Update column details (wipLimit, policy, title).
- `DELETE /api/columns/:id` - Delete column.

---

## 4. Swimlanes Endpoints
- `POST /api/boards/:boardId/swimlanes` - Add horizontal swimlane.
  - Body: `{ title, order? }`
- `PATCH /api/swimlanes/:id` - Update swimlane title or order.
- `DELETE /api/swimlanes/:id` - Delete swimlane.

---

## 5. Cards Endpoints
- `POST /api/boards/:boardId/cards` - Create new work card.
  - Body: `{ title, description?, columnId, swimlaneId?, size?, priority? }`
- `GET /api/cards/:id` - Get card details with aging metrics.
- `PATCH /api/cards/:id` - Move card (update columnId, swimlaneId, position) or update attributes.
- `PATCH /api/cards/:id/block` - Toggle blocker status.
  - Body: `{ isBlocked: boolean, blockReason?: string }`
- `DELETE /api/cards/:id` - Delete card.

---

## 6. Lean Metrics & Analytics Endpoints
- `GET /api/boards/:boardId/analytics` - Retrieve throughput, average lead time, average cycle time, and CFD distribution.

---

## 7. System Health
- `GET /api/health` - Health check status (`{ status: "ok", timestamp }`).
