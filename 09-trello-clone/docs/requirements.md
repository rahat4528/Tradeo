# Project 09: Trello Clone — Requirements & Specification

## 1. Overview & System Purpose
Trello Clone is a real-time, visual project management and task board application designed for teams and individuals to organize initiatives into boards, lists, and actionable cards. It enables intuitive workflow visualization through drag-and-drop mechanics, rich card details (labels, checklists, due dates, file attachments, member assignments), activity audit trails, and multi-client real-time synchronization.

---

## 2. Core Functional Requirements

### 2.1 Workspace & Board Administration
- **Workspaces & Organizations**: Teams group multiple boards under collaborative workspaces.
- **Board CRUD**:
  - Title, description, background color or gradient presets.
  - Visibility settings: `PRIVATE` (members only) vs `PUBLIC` (workspace-wide read access).
  - Member management: invite collaborators with roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **Board Archiving & Starred Boards**: Quick navigation to favorite or pinned boards.

### 2.2 Lists & Column Workflow
- **Ordered Lists**: Dynamic creation, renaming, reordering, and archiving of board columns (e.g., `Backlog`, `In Progress`, `Review`, `Done`).
- **Drag-and-Drop Reordering**: Positional sorting index maintaining strict sequence across list movements.

### 2.3 Card Management & Deep Workflows
- **Card Lifecycle**:
  - Title, rich description, and cover color.
  - Dynamic drag-and-drop movement across different lists and reordering within the same list.
  - Due date tracking with visual status tags (overdue, due soon, completed).
- **Checklists & Subtasks**:
  - Multi-item checklists per card.
  - Item toggle with real-time percentage progress bar.
- **Labels & Taxonomies**:
  - Color-coded tags (e.g., `Bug`, `Feature`, `High Priority`, `Docs`).
- **Member Assignment**:
  - Assign one or multiple team members to cards.
- **Attachments & Links**:
  - Store external resource links and metadata.
- **Activity & Comments Log**:
  - Detailed audit trail tracking every movement, checklist toggle, assignment, and comment.

### 2.4 Real-Time Collaboration & Synchronization
- **WebSocket Gateway (Socket.IO)**:
  - Board room subscriptions: clients join room `board:<boardId>`.
  - Instant dispatch on events: `card:moved`, `card:created`, `card:updated`, `list:reordered`, `comment:added`.
  - Optimistic client-side UI updates with server confirmation and fallback.

### 2.5 Search & Filter Capabilities
- Fast instant filtering by keyword, label color, assigned member, and due date range.

---

## 3. Architecture & Port Allocations
- **Backend Service**: NestJS (Node.js 20, TypeScript, Socket.IO Gateway), Port `4008`
- **Frontend Workbench**: Next.js 14 (App Router, Tailwind CSS, Lucide, HTML5 Drag & Drop), Port `3008`
- **Database**: PostgreSQL 16, Port `5440`
- **Containerization**: Docker Compose service definitions
