# Project 08: API Testing Tool — Requirements & Specification

## 1. Overview & System Purpose
The API Testing Tool is an interactive, developer-centric workbench for constructing, dispatching, inspecting, and automating HTTP requests. It empowers software engineers, QA teams, and backend developers to execute RESTful API operations, validate responses, persist historical dispatches, organize requests into hierarchical collections, and run assertion suites with variable substitution and SSRF (Server-Side Request Forgery) protection.

---

## 2. Core Functional Requirements

### 2.1 Request Construction Workbench
- **HTTP Methods**: Full support for standard verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- **Target URL & Parameter Interpolation**:
  - Raw and parameterized endpoints.
  - Query parameter key-value table with active/inactive toggles.
  - Automatic URL encoding and variable interpolation (e.g., `{{baseUrl}}/v1/users`).
- **Headers Management**:
  - Key-value headers with autocomplete for common standards (`Content-Type`, `Accept`, `Authorization`, etc.).
  - Header inheritance from active environment and workspace presets.
- **Body Formats**:
  - Raw JSON editor with syntax validation.
  - `application/x-www-form-urlencoded` key-value pairs.
  - `multipart/form-data` support.
  - Raw plain text / XML.
- **Authentication Helpers**:
  - Bearer Token: automatic `Authorization: Bearer <token>` injection.
  - Basic Auth: Base64 encoding of `username:password`.
  - API Key: custom header or query parameter placement.
  - Custom Headers.

### 2.2 Response Inspection & Metrics
- **Status Indicators**: HTTP status code, textual status reason, and color-coded badge.
- **Telemetry & Metrics**:
  - High-precision total request turnaround time in milliseconds (ms).
  - Response payload size in bytes/kilobytes.
- **Payload Viewers**:
  - Pretty-printed JSON view with syntax coloration.
  - Raw response view.
  - Response headers inspector with copy-to-clipboard capabilities.

### 2.3 Environment & Variable Substitution
- **Environments**: Isolated environments (e.g., `Localhost`, `Staging`, `Production`).
- **Variables**: Key-value pairs stored securely within an environment.
- **Dynamic Interpolation**: Regex substitution engine resolving `{{variable_name}}` across URL, headers, and request body before dispatch.

### 2.4 Collections & Folder Hierarchy
- **Hierarchical Tree**: Workspaces -> Collections -> Nested Folders -> Saved Requests.
- **Export / Import**: Standardized JSON collection export and import capabilities for team sharing.
- **Rapid Replay**: One-click dispatch of any saved collection item.

### 2.5 Request History
- Automatic chronological logging of executed requests.
- Filter and search by method, status code, and URL.
- One-click restore: load any historical execution back into the active workbench.

### 2.6 Security & SSRF Protection
- **SSRF Guard**: Strict server-side validation rejecting attempts to target dangerous private/local addresses:
  - Loopback (`127.0.0.1`, `localhost`, `::1`) when running in restricted cloud mode (or configurable via whitelist/blacklist flag).
  - AWS/GCP/Azure instance metadata endpoints (`169.254.169.254`).
  - Private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) in restricted network contexts.
  - Configurable local bypass flag for local development testing (`ALLOW_LOCAL_DISPATCH=true`).

### 2.7 Automated Assertions & Test Scripts
- Declarative assertion rules evaluated against response data:
  - Status code equals `200` / `201`.
  - Response time is less than `N` ms.
  - Body contains expected JSON key or value.
  - Header presence checks.

---

## 3. Architecture & Port Allocations
- **Backend Service**: NestJS (Node.js 20, TypeScript), Port `4007`
- **Frontend Workbench**: Next.js 14 (App Router, Tailwind CSS, Monaco Editor), Port `3007`
- **Database**: PostgreSQL 16, Port `5439`
- **Containerization**: Docker Compose service definitions
