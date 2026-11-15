# Phase 6: Calendar Scheduling App (TimeSync) — Requirements Specification

## 1. Executive Summary

TimeSync is an enterprise calendar scheduling and appointment booking platform. It enables hosts (professionals, teams, consultants) to define custom event types, establish granular weekly availability windows, specify timezone preferences, enforce buffer intervals, prevent double bookings through strict concurrency controls, and provide friction-free public booking URLs for clients.

---

## 2. Core Functional Requirements

### 2.1 User Authentication & Profile
- Registration and secure authentication using JWT tokens and password hashing.
- Profile setup: username (used for unique public URL slugs like `/book/john-doe`), full name, email, avatar, primary timezone (IANA formatted, e.g., `America/New_York`, `UTC`, `Asia/Dhaka`).

### 2.2 Event Type Administration
- Hosts define one or multiple event types:
  - Title (e.g., "30 Min Discovery Call", "1-on-1 Mentorship")
  - Custom slug (e.g., `discovery-call`)
  - Description / Agenda markdown
  - Duration in minutes (e.g., 15, 30, 45, 60 min)
  - Location type (Google Meet, Zoom, Phone Call, In-Person)
  - Buffer time before and after meeting (in minutes, e.g., 10 min buffer)
  - Booking window horizon (e.g., bookable up to 60 days in advance)
  - Minimum notice period (e.g., at least 2 hours before start time)
  - Active toggle (enable/disable without deleting)

### 2.3 Availability Engine & Scheduling Rules
- **Weekly Schedule Rules**: Days of the week (Monday through Sunday), with one or multiple time slots per day (e.g., 09:00 - 12:00, 13:00 - 17:00).
- **Date Overrides**: Custom date exceptions (e.g., blocking full days for holidays, or extended hours on specific dates).
- **Conflict & Double-Booking Prevention**: Mathematical overlapping checks:
  - If existing booking exists between `[start, end]`, and new slot has `start < existing.end + bufferAfter` and `end > existing.start - bufferBefore`, reject slot.
  - Concurrency locks using database transactions to prevent race conditions during simultaneous slot reservations.
- **Timezone Detection & Normalization**: Universal UTC storage for all booking times, dynamic conversion to invitee's detected or chosen IANA timezone.

### 2.4 Public Booking Workflow
- Public invitee access to `/{username}/{event-slug}` without requiring client registration.
- Calendar picker displaying bookable days based on available slots.
- Available time slots calculated dynamically on the fly based on weekly schedules, date overrides, existing confirmed bookings, and buffer rules.
- Invitee form: Name, Email, Notes/Answers to custom questions.
- Instant booking creation with unique confirmation code.

### 2.5 Reschedule & Cancellation Flow
- Secure cancellation and rescheduling via unique booking token.
- Reason for cancellation logging and slot release back to availability pool.
- Booking status tracking: `CONFIRMED`, `CANCELLED`, `RESCHEDULED`, `COMPLETED`.

---

## 3. Technology Architecture & Port Allocations

- **Backend**: NestJS 10, TypeScript, Passport JWT, Swagger OpenAPI (`Port: 4005`)
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React (`Port: 3005`)
- **Database**: PostgreSQL 16 with Prisma ORM (`Port: 5437`)
- **Cache**: Redis 7 Alpine (`Port: 6382`)
- **Docker Compose**: Turnkey container orchestration for local testing and isolated runtime.
