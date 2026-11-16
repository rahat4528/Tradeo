# Project 09: Trello Clone — REST & WebSocket API Specification

Base REST URL: `http://localhost:4008/api/v1`
WebSocket Gateway: `ws://localhost:4008/events`

---

## 1. Authentication Endpoints
- `POST /auth/register` — Create user account & default workspace (`email`, `password`, `name`).
- `POST /auth/login` — Authenticate and receive JWT token.
- `GET /auth/me` — Retrieve current user profile and workspaces.

---

## 2. Boards Endpoints
- `GET /boards` — List boards accessible to the authenticated user.
- `POST /boards` — Create a new board (`title`, `description`, `color`, `visibility`).
- `GET /boards/:id` — Get full board details including all lists, cards, checklists, and members.
- `PUT /boards/:id` — Update board settings, title, or background color.
- `DELETE /boards/:id` — Archive/delete a board.
- `POST /boards/:id/members` — Invite or add a member to the board.

---

## 3. Lists Endpoints
- `POST /boards/:boardId/lists` — Create a list on the board (`title`, `position`).
- `PUT /lists/:id` — Rename list or update position index.
- `DELETE /lists/:id` — Delete list and cascade cards.

---

## 4. Cards Endpoints
- `POST /lists/:listId/cards` — Create a new card (`title`, `description`, `position`).
- `GET /cards/:id` — Retrieve detailed card metadata with activity logs and comments.
- `PUT /cards/:id` — Update card fields (title, description, due date, labels, cover color).
- `POST /cards/:id/move` — Move card across lists or reorder (`targetListId`, `newPosition`).
- `DELETE /cards/:id` — Delete a card.

---

## 5. Checklists & Items
- `POST /cards/:cardId/checklists` — Add checklist to card.
- `POST /checklists/:id/items` — Add an item to a checklist (`title`).
- `PUT /checklists/items/:itemId` — Toggle item completion (`isCompleted`) or rename.
- `DELETE /checklists/items/:itemId` — Remove checklist item.

---

## 6. Comments & Activity Logs
- `GET /cards/:cardId/activities` — Retrieve chronological audit trail for the card.
- `POST /cards/:cardId/comments` — Post a comment on the card.

---

## 7. WebSocket Events (Socket.IO)
- Client connects: `ws://localhost:4008`
- Client emits `joinBoard` with `{ boardId: "uuid" }`
- Server emits events to board room:
  - `card:created` — payload: new card object
  - `card:moved` — payload: `{ cardId, sourceListId, targetListId, newPosition }`
  - `card:updated` — payload: updated card object
  - `list:created` — payload: new list object
