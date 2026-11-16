# Agile Issue Tracker & Sprint Management Requirements

## 1. System Role & Scope
The Agile Issue Tracker is an enterprise-grade issue tracking, sprint planning, and workflow orchestration platform for software development, product, and QA engineering teams. The platform enables multi-project management, issue tracking (epics, user stories, tasks, bugs), sprint lifecycles (planning, active sprint execution, completion), backlog grooming, customizable workflow status columns, story point estimation, and assignee tracking.

## 2. Core Functional Modules

### 2.1 Project & Team Workspace Management
- Multiple software projects per workspace, identified by unique project key prefix (e.g. `TRAD`, `ENG`, `PROD`).
- Project lead/owner attribution and member collaboration roles (`ADMIN`, `MEMBER`, `VIEWER`).
- Configurable project settings including default issue types, workflows, and sprint cadences.

### 2.2 Agile Issue Lifecycle & Types
- **Issue Types**:
  - `EPIC`: High-level strategic initiative grouping stories and tasks.
  - `STORY`: User-facing functional requirement delivering product value.
  - `TASK`: Technical implementation, devops, or maintenance deliverable.
  - `BUG`: Defect or regression requiring triage and remediation.
- **Issue Key Generation**: Auto-incremented human-readable identifier formatted as `<PROJECT_KEY>-<INDEX>` (e.g., `TRAD-101`).
- **Priority Levels**: `LOWEST`, `LOW`, `MEDIUM`, `HIGH`, `HIGHEST`.
- **Estimation**: Numeric story point sizing (Fibonacci scale or integers) for sprint capacity planning.
- **Workflows & Status Columns**:
  - Default workflow states: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
  - Configurable transitions and ordering.

### 2.3 Sprint Planning & Backlog Management
- **Backlog View**:
  - Global project backlog containing unassigned or future-scheduled issues.
  - Drag-and-drop / select issue assignment into upcoming sprints.
  - Quick issue creation directly within the backlog view.
- **Sprint Lifecycle**:
  - Sprint creation with target start date, end date, sprint goal, and planned capacity.
  - Sprint states: `FUTURE` (planning), `ACTIVE` (in progress), `CLOSED` (completed).
  - Sprint activation constraint: Only one active sprint per project at a given time.
  - Sprint completion: Unfinished issues automatically roll over to the backlog or next sprint.

### 2.4 Active Sprint Scrum Board
- Multi-column visual board partitioned by workflow states (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
- Card rendering with issue key, issue type icon, priority badge, story points badge, and assignee avatar.
- Quick status transitions via drag-and-drop or select menu.
- Board filters: filter by assignee ("Only My Issues"), issue type, priority, and text search.

### 2.5 Issue Detail & Collaboration
- Rich markdown description editor.
- Assignee and reporter assignment.
- Comment stream with author attribution and timestamping.
- Parent epic association and subtask listing.

## 3. Non-Functional & Architecture Requirements
- **Independence**: Fully self-contained backend, frontend, database, and Redis cache.
- **Performance**: Redis caching for project issue lists and sprint summaries.
- **Type Safety**: End-to-end strict TypeScript across NestJS and Next.js 14.
- **Security**: JWT authentication, hashed passwords with bcrypt, project-level tenancy isolation.
