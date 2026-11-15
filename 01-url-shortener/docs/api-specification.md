# REST API Specification: URL Shortener

Base URL: `http://localhost:4000/api/v1`

## 1. Authentication Endpoints

### POST `/auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "Alex Johnson"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "uuid", "email": "user@example.com", "name": "Alex Johnson" },
    "token": "eyJhbGciOi..."
  }
  ```

### POST `/auth/login`
Authenticate user with email and password.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "user@example.com", "name": "Alex Johnson" }
  }
  ```

### GET `/auth/me`
Retrieve currently authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 2. Link Management Endpoints

### POST `/links`
Create a new shortened link. Anonymous requests permitted (creates public, unowned link).
- **Headers**: `Authorization: Bearer <token>` (Optional)
- **Request Body**:
  ```json
  {
    "targetUrl": "https://example.com/very/long/url",
    "customAlias": "campaign-launch",
    "description": "2026 Spring Launch",
    "password": "optional-link-password",
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "redirectCode": 307,
    "domainId": null
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "uuid",
    "slug": "campaign-launch",
    "shortUrl": "http://localhost:4000/r/campaign-launch",
    "targetUrl": "https://example.com/very/long/url",
    "description": "2026 Spring Launch",
    "isActive": true,
    "isProtected": true,
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "redirectCode": 307,
    "createdAt": "2026-11-16T00:00:00.000Z"
  }
  ```

### GET `/links`
List links owned by authenticated user with pagination and search.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page=1`, `limit=20`, `search=campaign`, `sortBy=createdAt`, `order=desc`
- **Response `200 OK`**

### GET `/links/:id`
Retrieve detailed metadata for a single link.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

### PATCH `/links/:id`
Update an existing link.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial link fields
- **Response `200 OK`**

### DELETE `/links/:id`
Delete a link and invalidate cache.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 3. Redirection & Verification Endpoints

### GET `/r/:slug`
Redirect to the target destination URL.
- **Response `301 / 302 / 307 / 308`**: Redirects to target location
- **Response `410 Gone`**: If link has expired
- **Response `401 Unauthorized`**: If link is password-protected (returns JSON challenge)

### POST `/r/:slug/verify`
Verify password for a protected link and obtain target URL.
- **Request Body**: `{ "password": "string" }`
- **Response `200 OK`**: `{ "targetUrl": "https://example.com/destination" }`

---

## 4. Analytics Endpoints

### GET `/analytics/overview`
Get aggregate user-level click summary.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

### GET `/analytics/links/:id`
Get detailed click metrics for a specific link.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `period=24h|7d|30d|all`
- **Response `200 OK`**:
  ```json
  {
    "totalClicks": 1248,
    "uniqueClicks": 982,
    "clicksByDate": [{ "date": "2026-11-15", "count": 140 }],
    "referrers": [{ "source": "twitter.com", "count": 620 }],
    "countries": [{ "code": "US", "name": "United States", "count": 510 }],
    "browsers": [{ "name": "Chrome", "count": 780 }],
    "os": [{ "name": "Windows", "count": 450 }]
  }
  ```

---

## 5. QR Code Endpoints

### GET `/qr/:slug`
Generate QR code for a shortened URL.
- **Query Params**: `format=svg|png`, `size=300`, `errorCorrection=M`
- **Response `200 OK`**: `image/svg+xml` or `image/png` or JSON data URL

---

## 6. Custom Domain Endpoints

### POST `/domains`
Add custom domain.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "domain": "go.brand.com", "fallbackUrl": "https://brand.com" }`
- **Response `201 Created`**

### GET `/domains`
List user domains.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**
