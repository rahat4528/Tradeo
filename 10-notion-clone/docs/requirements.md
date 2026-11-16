# Project 10: Notion Clone — Requirements & Specification

## 1. Overview & System Purpose
Notion Clone is a block-based document workspace and team knowledge management system. It allows teams and individuals to author structured documents, manage hierarchical sub-pages, configure page icons and cover headers, organize content with drag-and-drop block mechanics, perform full-text workspace searches, and export page trees to clean Markdown and HTML formats.

---

## 2. Core Functional Requirements

### 2.1 Workspace & Page Hierarchy
- **Workspaces**: Independent team workspaces isolating documents, templates, and permissions.
- **Hierarchical Document Trees**:
  - Arbitrary nesting: Pages can have child sub-pages to unlimited depth.
  - Page breadcrumbs and tree navigation sidebar with collapsibility.
  - Page metadata: Title, customizable emoji icon, cover image banner, and last-edited timestamp.
- **Favorites & Starred**: Pin critical pages to the top of the sidebar.
- **Trash & Soft-Delete**: Archived pages move to Trash with one-click restore or permanent purge.

### 2.2 Block-Based Content Architecture
- **Block Types**:
  - `PARAGRAPH`: Standard body text.
  - `HEADING_1`, `HEADING_2`, `HEADING_3`: Structured sectional headers.
  - `BULLET_LIST`, `NUMBERED_LIST`: Sequential and bulleted list items.
  - `TODO_LIST`: Interactive checkboxes with strikethrough states.
  - `CODE_BLOCK`: Code snippets with language flags.
  - `QUOTE`: Indented blockquotes.
  - `CALLOUT`: Highlighted informational box with custom emoji icon.
  - `DIVIDER`: Visual thematic break.
- **Block Operations**:
  - Add, edit content, reorder, convert block type, delete.
  - Ordering preserved through floating fractional positional indices.

### 2.3 Search & Retrieval
- Instant full-text search indexing page titles and block contents across the entire workspace.
- Keyboard navigation (Cmd/Ctrl + K workspace search).

### 2.4 Export & Sharing
- Export any page (including nested sub-pages) to clean standard **Markdown** (`.md`) format.
- Export to formatted standalone **HTML** with embedded styles.

---

## 3. Architecture & Port Allocations
- **Backend Service**: NestJS (Node.js 20, TypeScript, Prisma ORM), Port `4009`
- **Frontend Workbench**: Next.js 14 (App Router, Tailwind CSS, Lucide Icons), Port `3009`
- **Database**: PostgreSQL 16, Port `5441`
- **Containerization**: Docker Compose service definitions
