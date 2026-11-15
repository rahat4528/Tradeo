# Tradeo

Tradeo is an enterprise-grade collection of **13 standalone, production-quality business applications**. Each application operates independently with its own database, backend services, frontend user interface, test suites, and operational configurations.

---

## Applications Matrix

| # | Folder | Application | Architecture Stack | Description & Docs |
|---|---|---|---|---|
| **01** | [`01-url-shortener`](./01-url-shortener) | **URL Shortener** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Minimal link-management dashboard with click tracking, custom aliases, QR codes, expiration, and analytics. [Docs](./01-url-shortener/README.md) |
| **02** | [`02-code-snippet-manager`](./02-code-snippet-manager) | **Code Snippet Manager** | Next.js, NestJS, PostgreSQL, Prisma, Monaco | Developer-focused snippet organizer with syntax highlighting, tagging, version history, and search. [Docs](./02-code-snippet-manager/README.md) |
| **03** | [`03-restaurant-menu-management`](./03-restaurant-menu-management) | **Restaurant Menu Management** | Next.js, NestJS, PostgreSQL, Prisma, MinIO | Menu, category, variant, and allergen management with QR code digital menus. [Docs](./03-restaurant-menu-management/README.md) |
| **04** | [`04-task-management-app`](./04-task-management-app) | **Task Management App** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Personal and team task management with priorities, subtasks, recurring rules, and status tracking. [Docs](./04-task-management-app/README.md) |
| **05** | [`05-inventory-management-system`](./05-inventory-management-system) | **Inventory Management System** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Multi-warehouse inventory tracking, SKU & barcode management, reorder alerts, and audit trails. [Docs](./05-inventory-management-system/README.md) |
| **06** | [`06-calendar-scheduling-app`](./06-calendar-scheduling-app) | **Calendar Scheduling App** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Booking interface with availability configuration, conflict detection, and public scheduling links. [Docs](./06-calendar-scheduling-app/README.md) |
| **07** | [`07-crm-application`](./07-crm-application) | **CRM Application** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Sales pipeline, lead and deal tracking, contact management, and team activity analytics. [Docs](./07-crm-application/README.md) |
| **08** | [`08-api-testing-tool`](./08-api-testing-tool) | **API Testing Tool** | Next.js, Node.js, Monaco, PostgreSQL | Visual HTTP request builder, response inspector, environment variable manager, and test runner. [Docs](./08-api-testing-tool/README.md) |
| **09** | [`09-trello-clone`](./09-trello-clone) | **Trello Clone** | Next.js, NestJS, PostgreSQL, Prisma, Socket.IO | Collaborative card-and-list boards with drag-and-drop, comments, checklists, and real-time updates. [Docs](./09-trello-clone/README.md) |
| **10** | [`10-notion-clone`](./10-notion-clone) | **Notion Clone** | Next.js, NestJS, PostgreSQL, Prisma, Tiptap | Block-based document workspace with nested pages, rich text formatting, and media attachments. [Docs](./10-notion-clone/README.md) |
| **11** | [`11-jira-clone`](./11-jira-clone) | **Jira Clone** | Next.js, NestJS, PostgreSQL, Prisma, Redis | Software issue tracker with sprints, backlogs, workflow states, and project reporting. [Docs](./11-jira-clone/README.md) |
| **12** | [`12-kanban-board`](./12-kanban-board) | **Kanban Board** | React, NestJS, PostgreSQL, Prisma, dnd-kit | Visual workflow board focused on Work-In-Progress (WIP) constraints and cycle-time optimization. [Docs](./12-kanban-board/README.md) |
| **13** | [`13-devops-dashboard`](./13-devops-dashboard) | **DevOps Dashboard** | React, Node.js, PostgreSQL, Prometheus, Docker | Observability and health monitoring dashboard for infrastructure metrics and alert rules. [Docs](./13-devops-dashboard/README.md) |

---

## Architectural Principles

1. **Total Isolation**: Each application has its own dedicated backend, frontend, database schema, migrations, environment configuration, and test suites.
2. **Zero Shared State**: No database tables or cache namespaces are shared across applications.
3. **End-to-End Type Safety**: Strict TypeScript across both backend and frontend layers.
4. **Comprehensive Automated Testing**: Unit, integration, API contract, and security test suites per application.
5. **Turnkey Deployment**: Each project includes its own `docker-compose.yml` for deterministic, isolated local deployment.

---

## Repository Documentation

- [Architecture Overview](./docs/architecture.md)
- [Development Guide](./docs/development-guide.md)
- [Technology Stack Matrix](./docs/technology-stack.md)
- [Project Index](./docs/project-index.md)
- [Progress Tracker](./PROGRESS.md)

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
