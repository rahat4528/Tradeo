# REST API Specification: Code Snippet Manager

Base URL: `http://localhost:4001/api/v1`

## 1. Authentication Endpoints

### POST `/auth/register`
- **Request Body**: `{ "email": "dev@tradeo.local", "password": "Password123!", "name": "Dev User" }`
- **Response `201 Created`**: `{ "user": { ... }, "token": "jwt-token" }`

### POST `/auth/login`
- **Request Body**: `{ "email": "dev@tradeo.local", "password": "Password123!" }`
- **Response `200 OK`**: `{ "user": { ... }, "token": "jwt-token" }`

### GET `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 2. Snippet Endpoints

### POST `/snippets`
Create a new snippet.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Debounce Hook in React",
    "description": "Standard utility hook for input throttling",
    "language": "typescript",
    "code": "export function useDebounce<T>(value: T, delay: number) { ... }",
    "isFavorite": false,
    "isPublic": false,
    "folderId": "uuid-or-null",
    "tags": ["react", "hooks", "typescript"]
  }
  ```
- **Response `201 Created`**

### GET `/snippets`
List snippets with full-text search and filtering.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `search`: string (matches title, description, code)
  - `language`: string (e.g. `python`)
  - `folderId`: uuid (folder filter)
  - `tag`: string (tag filter)
  - `isFavorite`: boolean (true/false)
  - `page`: number (default 1)
  - `limit`: number (default 20)
- **Response `200 OK`**: `{ "data": [...], "pagination": { ... } }`

### GET `/snippets/:id`
Retrieve snippet details including tags and folder metadata.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

### PATCH `/snippets/:id`
Update a snippet. Automatically records a historical version.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial snippet fields + optional `versionSummary`
- **Response `200 OK`**

### DELETE `/snippets/:id`
Delete a snippet and its revisions.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 3. Version History Endpoints

### GET `/snippets/:id/history`
List revision history snapshots for a snippet.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: `[{ "id": "uuid", "versionNumber": 2, "code": "...", "createdAt": "..." }]`

### POST `/snippets/:id/rollback/:versionId`
Rollback snippet code and language to a previous historical version.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 4. Folder Management Endpoints

### POST `/folders`
Create a folder.
- **Request Body**: `{ "name": "Algorithms", "parentId": null }`
- **Response `201 Created`**

### GET `/folders`
List folder tree for user.
- **Response `200 OK`**

### PATCH `/folders/:id`
Rename or move folder.
- **Response `200 OK`**

### DELETE `/folders/:id`
Delete folder (snippets within are moved to root/unassigned).
- **Response `200 OK`**

---

## 5. Tag Endpoints

### GET `/tags`
List all tags with snippet counts.
- **Response `200 OK`**

---

## 6. Import & Export Endpoints

### GET `/export`
Export all user snippets as structured JSON.
- **Response `200 OK`**

### POST `/import`
Bulk import snippets from JSON payload.
- **Request Body**: `{ "snippets": [...] }`
- **Response `200 OK`**: `{ "importedCount": 15 }`
