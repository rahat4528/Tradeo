# Project 08: API Testing Tool — REST API Specification

Base URL: `http://localhost:4007/api/v1`

---

## 1. Authentication & Workspace Endpoints
- `POST /auth/register` — Create a user account and default personal workspace.
- `POST /auth/login` — Authenticate and receive a JWT Bearer token.
- `GET /auth/me` — Retrieve active authenticated user profile and default workspace.

---

## 2. Dispatch Proxy Engine (Core)
- `POST /proxy/dispatch`
  - Purpose: Core proxy endpoint executing the constructed HTTP request from the backend to prevent CORS restrictions and apply SSRF security guards.
  - Body:
    ```json
    {
      "method": "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS",
      "url": "https://api.example.com/v1/users",
      "headers": { "Accept": "application/json", "Authorization": "Bearer token" },
      "params": { "limit": "10", "page": "1" },
      "body": "{\"key\": \"value\"}",
      "bodyType": "JSON" | "FORM_DATA" | "URL_ENCODED" | "RAW",
      "environmentId": "uuid-optional",
      "assertions": [
        { "type": "STATUS_EQUALS", "target": "200" },
        { "type": "RESPONSE_TIME_LT", "target": "500" },
        { "type": "JSON_BODY_CONTAINS", "target": "token" }
      ]
    }
    ```
  - Response:
    ```json
    {
      "status": 200,
      "statusText": "OK",
      "timeMs": 142,
      "sizeBytes": 2048,
      "headers": { "content-type": "application/json; charset=utf-8" },
      "data": { ... },
      "assertions": [
        { "type": "STATUS_EQUALS", "passed": true, "message": "Expected 200, got 200" }
      ],
      "historyId": "uuid"
    }
    ```

---

## 3. Collections & Saved Requests
- `GET /collections` — List all collections and nested folders for the active workspace.
- `POST /collections` — Create a new collection or folder (`name`, `parentId`, `description`).
- `GET /collections/:id` — Get collection details with all nested requests.
- `POST /collections/:id/requests` — Save an HTTP request under a collection or folder.
- `PUT /collections/requests/:id` — Update a saved request.
- `DELETE /collections/requests/:id` — Delete a saved request.
- `DELETE /collections/:id` — Delete a collection and all nested items.
- `GET /collections/export` — Export collections as a standardized JSON schema.
- `POST /collections/import` — Import collections from an uploaded JSON schema.

---

## 4. Environments & Variables
- `GET /environments` — List all configured environments (`Production`, `Staging`, etc.).
- `POST /environments` — Create a new environment (`name`, `variables`: `[{ key, value, isSecret }]`).
- `PUT /environments/:id` — Update environment variables.
- `DELETE /environments/:id` — Remove an environment.

---

## 5. Execution History
- `GET /history` — Retrieve paginated request execution history with search filters.
- `GET /history/:id` — Retrieve detailed request and response payload for a past execution.
- `DELETE /history` — Clear execution history.
