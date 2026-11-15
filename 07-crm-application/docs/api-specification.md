# NexusCRM API Specification (Port 4006)

## Base URL: `http://localhost:4006` (API Docs: `/api/docs`)

### 1. Authentication (`/auth`)
- `POST /auth/register` — Register enterprise organization and initial manager account.
- `POST /auth/login` — Sign in and issue JWT token.
- `GET /auth/me` — Retrieve current authenticated user profile and team role.

### 2. Companies (`/companies`)
- `GET /companies?search=...&industry=...` — List and filter companies.
- `POST /companies` — Create company account (`{ name, domain, industry, phone, address, annualRevenue }`).
- `GET /companies/:id` — Get company details, associated contacts, deals, and activities.
- `PATCH /companies/:id` — Update company profile.
- `DELETE /companies/:id` — Remove company.

### 3. Contacts (`/contacts`)
- `GET /contacts?search=...&companyId=...` — List and filter contacts.
- `POST /contacts` — Create contact (`{ firstName, lastName, email, phone, title, companyId, leadSource }`).
- `GET /contacts/:id` — Contact details and activity log.
- `PATCH /contacts/:id` — Update contact.
- `DELETE /contacts/:id` — Remove contact.

### 4. Deals & Sales Pipeline (`/deals`)
- `GET /deals?stage=...&ownerId=...` — Fetch deals list.
- `GET /deals/pipeline` — Fetch deals grouped by stage with column value totals.
- `POST /deals` — Create deal (`{ title, companyId, contactId, value, stage, closeDate, probability }`).
- `GET /deals/:id` — Deal details, timeline activities, and tasks.
- `PATCH /deals/:id/stage` — Advance deal stage (`{ stage: DealStage }`).
- `PATCH /deals/:id` — Update deal properties.
- `DELETE /deals/:id` — Remove deal.

### 5. Activities & Tasks (`/activities`)
- `GET /activities?dealId=...&companyId=...` — Timeline interactions.
- `POST /activities` — Log note, call, meeting, or email (`{ type, title, body, dealId, companyId, contactId }`).
- `POST /activities/tasks` — Create task reminder (`{ title, dueDate, dealId, priority }`).
- `PATCH /activities/tasks/:id/complete` — Mark task as completed.

### 6. Analytics & Dashboard (`/analytics`)
- `GET /analytics/dashboard` — Pipeline totals, weighted forecast, win rate, stage breakdowns.
