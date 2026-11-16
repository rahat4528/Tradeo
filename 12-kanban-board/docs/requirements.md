# Process Flow Visualizer & Kanban Board Requirements

## 1. System Role & Scope
The Kanban Board is a lean flow management and process visualization system designed for operations, platform engineering, and software delivery teams. Unlike traditional task boards, this platform focuses strictly on bottleneck elimination, Work-In-Progress (WIP) limit constraints, swimlane stratification, card aging visualization, blocker triage, and cycle time analytics (lead time, cycle time, throughput).

## 2. Core Functional Capabilities

### 2.1 Boards & Workflow Columns
- Configurable process stages with explicit entry/exit policies.
- Per-column Work-In-Progress (WIP) limit enforcement:
  - Minimum WIP and Maximum WIP limits.
  - Visual breach indicators (warning color highlights when limit exceeded).
  - Optional hard enforcement rejection when column exceeds limit.
- Sub-columns support: Splitting columns into active ("Doing") and finished ("Done") buffers to surface bottlenecks.

### 2.2 Swimlanes & Classification of Work
- Horizontal swimlanes partitioning cards by class of service:
  - `EXPEDITE` (critical path, emergency hotfixes bypassing WIP limits).
  - `STANDARD` (regular planned business initiatives).
  - `FIXED_DATE` (deadline-driven deliverables).
  - `INTANGIBLE` (technical debt remediation, research).
- Custom swimlanes (e.g. by project, initiative, or functional team).

### 2.3 Cards & Lean Metadata
- Unique identifier and title.
- Card aging: Days in current column and total days since creation.
- Blocker flag & triage: Mark card as `isBlocked` with a blocker reason and timestamp.
- Size estimation / priority tagging.
- Timestamps: `createdAt`, `startedAt` (first move out of backlog), `completedAt` (move to terminal column).

### 2.4 Lean Analytics & Cycle Time Metrics
- **Lead Time**: Time elapsed from card creation to completion.
- **Cycle Time**: Time elapsed from work start (`startedAt`) to completion (`completedAt`).
- **Throughput**: Number of work items completed per day / week.
- **WIP Distribution**: Instant count of work items currently active across all in-progress stages.
- **Cumulative Flow Diagram (CFD)**: Work distribution over time across backlog, in-progress, and completed states.

## 3. Non-Functional & Architecture Requirements
- **Independence**: Isolated backend, frontend, database schema, migrations, and docker-compose.
- **Performance**: Sub-10ms column transitions with real-time optimistic state updates.
- **Strict Typing**: End-to-end TypeScript between NestJS backend and Next.js 14 frontend.
- **Security**: JWT authentication, hashed passwords with bcrypt, workspace tenant isolation.
