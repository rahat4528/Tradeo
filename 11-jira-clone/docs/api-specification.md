# Agile Issue Tracker REST API Specification

## Base URL
`/api`

## Authentication
Bearer token JWT header: `Authorization: Bearer <token>`

---

## 1. Authentication Endpoints
- `POST /api/auth/register` - Create user account and personal workspace.
  - Body: `{ email, password, name }`
  - Response: `{ accessToken, user }`
- `POST /api/auth/login` - Authenticate user credentials.
  - Body: `{ email, password }`
  - Response: `{ accessToken, user }`
- `GET /api/auth/me` - Current authenticated user profile.

---

## 2. Projects Endpoints
- `GET /api/projects` - List all projects in workspace.
- `POST /api/projects` - Create new project.
  - Body: `{ name, key, description? }`
- `GET /api/projects/:id` - Get project details with issue type and status metadata.
- `PATCH /api/projects/:id` - Update project metadata or settings.
- `DELETE /api/projects/:id` - Archive or remove project.

---

## 3. Sprints Endpoints
- `GET /api/projects/:projectId/sprints` - List all sprints for a project.
- `POST /api/projects/:projectId/sprints` - Create new sprint.
  - Body: `{ name, goal?, startDate?, endDate? }`
- `PATCH /api/sprints/:id` - Update sprint details or state (`FUTURE`, `ACTIVE`, `CLOSED`).
- `POST /api/sprints/:id/start` - Start sprint (transitions from `FUTURE` to `ACTIVE`).
- `POST /api/sprints/:id/complete` - Complete sprint, rolling unfinished issues to backlog.

---

## 4. Issues Endpoints
- `GET /api/projects/:projectId/issues` - List project issues with query filters (`sprintId`, `type`, `priority`, `status`, `assigneeId`, `search`).
- `POST /api/projects/:projectId/issues` - Create new issue.
  - Body: `{ title, type, priority, description?, storyPoints?, sprintId?, parentId?, assigneeId? }`
  - Auto-assigns issue key formatted as `<PROJECT_KEY>-<INDEX>`.
- `GET /api/issues/:id` - Retrieve issue details including comments and subtasks.
- `PATCH /api/issues/:id` - Update issue properties (status, sprint, assignee, story points, etc.).
- `DELETE /api/issues/:id` - Delete issue.

---

## 5. Comments Endpoints
- `GET /api/issues/:issueId/comments` - List comments for an issue.
- `POST /api/issues/:issueId/comments` - Post comment on an issue.
  - Body: `{ content }`
- `DELETE /api/comments/:id` - Remove comment.

---

## 6. System Health
- `GET /api/health` - Health check status (`{ status: "ok", timestamp }`).
