# System Requirements Specification: Task Management Platform

## 1. Executive Summary

The **Task Management Platform** is a high-performance productivity workspace designed for individuals, autonomous professionals, and collaborative teams. It delivers hierarchical task breakdowns, subtask trees, priority classifications, calendar deadline scheduling, recurring task generators (daily, weekly, monthly, custom cron-like intervals), reminder dispatching, tag and category taxonomy, real-time status management, and quantitative productivity metrics.

## 2. Core Functional Requirements

### 2.1 User Authentication & Profile Security
- User registration and authentication using email and cryptographically hashed passwords (bcrypt).
- Stateless JWT issuance with configurable expiration and secure bearer token verification.
- Personalized workspace preferences: default view (List, Board, Matrix), reminder notification channels, and timezone offsets.

### 2.2 Task Engineering & Hierarchical Subtasks
- Comprehensive Task CRUD operations:
  - Title, rich Markdown descriptions, estimated completion duration (minutes), and assigned labels.
  - Priority levels: `CRITICAL` (P1 - Urgent & Important), `HIGH` (P2), `MEDIUM` (P3), `LOW` (P4).
  - Status lifecycle: `BACKLOG`, `TODO`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `CANCELLED`.
  - Nested Subtasks: Multi-level checklist items with independent completion toggles and parent task progress recalculation (e.g., 3/5 subtasks completed = 60%).

### 2.3 Due Dates, Recurrence & Scheduling Engine
- Specific date and optional time deadlines with timezone awareness.
- Recurrence configuration:
  - Frequency rules: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, or `CUSTOM_INTERVAL`.
  - Recurrence interval (e.g. every 2 weeks, every 3 days).
  - Auto-generation of next iteration upon marking a recurring task complete.

### 2.4 Categories, Projects & Tag Taxonomy
- Group tasks into dedicated project spaces or color-coded categories (e.g. Work, Personal, Engineering, Financial).
- Multi-tag assignment for cross-cutting queries (e.g. `#urgent`, `#client-alpha`, `#refactor`).

### 2.5 Reminders & Notification Queues
- Reminder scheduling: Exact trigger timestamps before due date (e.g., 15 minutes before, 1 hour before, 1 day before).
- Asynchronous task worker backed by Redis queue for reminder scheduling and automated dispatch.

### 2.6 Personal Dashboard, Search & Filter Matrix
- Multi-dimensional filters:
  - Filter by date: Today, Upcoming 7 Days, Overdue, Completed, Any.
  - Filter by priority, category, status, and custom tags.
  - Full-text instant search across task titles and descriptions.
- Productivity metrics:
  - Completed vs open task ratio.
  - On-time completion rate (%) and overdue count.
  - Daily velocity and weekly completion streak tracker.

---

## 3. Non-Functional Requirements

- **Performance**: Sub-50ms API query response time for task listing, indexing on `userId`, `status`, `dueDate`, and `priority`.
- **Reliability**: Deterministic recurrence calculation and transactional subtask progress updates.
- **Independence**: Fully self-contained database, configuration, dependencies, and test suite with zero monorepo coupling.
