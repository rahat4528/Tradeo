# Phase 7: CRM Application (NexusCRM) — Requirements Specification

## 1. Executive Summary

NexusCRM is an enterprise customer relationship and sales pipeline platform. It provides B2B sales teams with comprehensive contact management, account/company hierarchies, multi-stage sales pipeline tracking, interaction logs (calls, meetings, notes, emails), follow-up task reminders, role-based access control (Sales Rep vs. Manager), and real-time revenue forecasting dashboards.

---

## 2. Core Functional Requirements

### 2.1 Multi-Tenant Organization & RBAC
- Enterprise organization workspace with user role permissions:
  - `MANAGER`: Full access to team pipelines, revenue forecasts, reassignment of deals, and organizational exports.
  - `SALES_REP`: Access to assigned accounts, contacts, and personal deal pipeline.
- Secure registration and JWT-based authentication.

### 2.2 Companies & Contacts Directory
- **Company Accounts**:
  - Name, Domain/Website, Industry, Annual Revenue, Phone, Address, Tier (Enterprise, Mid-Market, SMB), Account Owner.
- **Contacts**:
  - First Name, Last Name, Email, Phone, Job Title, Associated Company, Social profiles, Lead Source.
- Filter, search, and CSV import/export capabilities.

### 2.3 Visual Sales Pipeline & Deal Stages
- Multi-stage kanban-like sales funnel:
  1. `LEAD` (10% win probability)
  2. `QUALIFIED` (25% win probability)
  3. `PROPOSAL` (50% win probability)
  4. `NEGOTIATION` (75% win probability)
  5. `CLOSED_WON` (100% win probability)
  6. `CLOSED_LOST` (0% win probability)
- Deal entities:
  - Title, Associated Company, Primary Contact, Monetary Value, Stage, Target Close Date, Win Probability, Assigned Owner.
- Drag-and-drop or one-click stage progression with automatic pipeline valuation and weighted forecast calculations.

### 2.4 Interaction History & Activity Timeline
- Chronological timeline on companies and deals recording:
  - Notes (rich markdown context)
  - Logged Calls (duration, outcome, summary)
  - Emails (sent/received correspondence logs)
  - Meetings (agenda, attendees, action items)
- Follow-up task reminders linked to specific deals with due dates and completion checkboxes.

### 2.5 Revenue Analytics & Pipeline Dashboard
- Real-time pipeline metrics:
  - Total Pipeline Value ($)
  - Weighted Pipeline Forecast ($ = sum of value * probability)
  - Closed Won Total ($)
  - Win Rate Percentage (%)
  - Stage-by-stage distribution breakdown and deal count
- Top performing deals and upcoming high-priority task reminders.

---

## 3. Technology Architecture & Port Allocations

- **Backend**: NestJS 10, TypeScript, Passport JWT, Swagger OpenAPI (`Port: 4006`)
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React (`Port: 3006`)
- **Database**: PostgreSQL 16 with Prisma ORM (`Port: 5438`)
- **Cache**: Redis 7 Alpine (`Port: 6383`)
- **Docker Compose**: Turnkey container orchestration for local testing and isolated runtime.
