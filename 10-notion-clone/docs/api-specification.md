# Project 10: Notion Clone — REST API Specification

Base REST URL: `http://localhost:4009/api/v1`

---

## 1. Authentication Endpoints
- `POST /auth/register` — Create user account & default personal document workspace.
- `POST /auth/login` — Authenticate and receive JWT Bearer token.
- `GET /auth/me` — Retrieve active profile and workspace.

---

## 2. Pages Endpoints
- `GET /pages` — Retrieve hierarchical page tree for the active workspace.
- `POST /pages` — Create a new page (`title`, `parentId`, `icon`, `coverUrl`).
- `GET /pages/:id` — Get page details with its full block sequence and sub-pages.
- `PUT /pages/:id` — Update page metadata (title, icon, coverUrl, isFavorite, isArchived).
- `DELETE /pages/:id` — Soft-delete page to trash (or restore via `PUT /pages/:id/restore`).
- `DELETE /pages/:id/permanent` — Permanently purge a page and its blocks.
- `GET /pages/:id/export` — Export page to Markdown (`format=markdown`) or HTML (`format=html`).

---

## 3. Blocks Endpoints
- `POST /pages/:pageId/blocks` — Create a block in a page (`type`, `content`, `position`, `properties`).
- `PUT /blocks/:id` — Update block content or properties.
- `POST /blocks/:id/reorder` — Reorder block position within the page (`newPosition`).
- `DELETE /blocks/:id` — Remove a block.

---

## 4. Search & Workspace Endpoints
- `GET /search?q=:query` — Full-text search across all page titles and block contents.
- `GET /pages/trash` — List all soft-deleted pages in the trash bin.
