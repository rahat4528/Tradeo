# API Specification: Task Management Platform

Base URL: `/api/v1`

## 1. Authentication Endpoints

### POST `/auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "email": "developer@tradeo.io",
    "password": "SecurePassword123!",
    "name": "Jane Doe",
    "timezone": "America/New_York"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "uuid", "email": "developer@tradeo.io", "name": "Jane Doe" },
    "token": "jwt_token_string"
  }
  ```

### POST `/auth/login`
Authenticate user credentials and issue JWT.
- **Request Body**:
  ```json
  {
    "email": "developer@tradeo.io",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "jwt_token_string",
    "user": { "id": "uuid", "email": "developer@tradeo.io", "name": "Jane Doe" }
  }
  ```

### GET `/auth/me`
Retrieve currently authenticated profile and workspace statistics.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: `{ "user": { ... } }`

---

## 2. Categories / Projects Endpoints

### POST `/categories`
Create a task category or project folder.
- **Request Body**:
  ```json
  {
    "name": "Frontend Sprint",
    "color": "#3B82F6",
    "icon": "folder"
  }
  ```

### GET `/categories`
List user categories with task counts.

### PATCH `/categories/:id`
Update category name, color, or icon.

### DELETE `/categories/:id`
Delete category (tasks become uncategorized).

---

## 3. Tasks Endpoints

### POST `/tasks`
Create a new task with optional subtasks and recurrence rule.
- **Request Body**:
  ```json
  {
    "title": "Design responsive navigation component",
    "description": "Implement mobile hamburger drawer and keyboard accessibility",
    "priority": "HIGH",
    "status": "TODO",
    "categoryId": "category-uuid",
    "dueDate": "2026-11-20T18:00:00Z",
    "recurrence": "WEEKLY",
    "recurrenceInterval": 1,
    "tags": ["frontend", "accessibility"],
    "subtasks": [
      { "title": "Wireframe desktop layout" },
      { "title": "Implement mobile sheet" }
    ]
  }
  ```

### GET `/tasks`
List user tasks with filtering and pagination.
- **Query Parameters**:
  - `status`: `BACKLOG | TODO | IN_PROGRESS | BLOCKED | COMPLETED`
  - `priority`: `CRITICAL | HIGH | MEDIUM | LOW`
  - `categoryId`: filter by category
  - `filter`: `today | upcoming | overdue | completed | all`
  - `search`: string query
  - `tag`: string tag

### GET `/tasks/:id`
Retrieve single task with nested subtasks, comments, and reminders.

### PATCH `/tasks/:id`
Update task fields.

### PATCH `/tasks/:id/status`
Update task status. If transitioning to `COMPLETED` on a recurring task, the next occurrence is automatically scheduled.
- **Request Body**: `{ "status": "COMPLETED" }`

### DELETE `/tasks/:id`
Delete task and associated subtasks.

---

## 4. Subtasks Endpoints

### POST `/tasks/:taskId/subtasks`
Add a subtask to an existing parent task.
- **Request Body**: `{ "title": "Review pull request" }`

### PATCH `/subtasks/:id/toggle`
Toggle completion state of a subtask. Automatically updates parent completion percentage.

### DELETE `/subtasks/:id`
Remove a subtask.

---

## 5. Analytics & Dashboard Endpoints

### GET `/analytics/summary`
Retrieve user productivity statistics:
- Total tasks, completed tasks, overdue tasks, today's due tasks.
- Priority distribution matrix.
- Completion velocity over past 7 and 30 days.
