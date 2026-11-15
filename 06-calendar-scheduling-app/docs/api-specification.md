# TimeSync API Specification (Port 4005)

## Base URL: `http://localhost:4005` (API Docs: `/api/docs`)

### 1. Authentication (`/auth`)
- `POST /auth/register` — Register host account (`{ username, name, email, password, timezone }`).
- `POST /auth/login` — Sign in and receive JWT token (`{ email, password }`).
- `GET /auth/me` — Retrieve current authenticated host profile.
- `PATCH /auth/profile` — Update host profile and default timezone.

### 2. Event Types (`/event-types`)
- `GET /event-types` — List host's event types.
- `POST /event-types` — Create new event type (`{ title, slug, durationMinutes, description, locationType, bufferBefore, bufferAfter, isActive }`).
- `GET /event-types/:id` — Retrieve single event type details.
- `PATCH /event-types/:id` — Update event type configurations.
- `DELETE /event-types/:id` — Archive or delete event type.

### 3. Availability Schedules (`/availability`)
- `GET /availability` — Fetch current host weekly schedule and overrides.
- `PUT /availability/schedule` — Set weekly working days and hours (`{ schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, ...] }`).
- `POST /availability/overrides` — Add specific date override (`{ date: '2026-12-25', isUnavailable: true }`).
- `DELETE /availability/overrides/:id` — Remove date override.

### 4. Public Booking & Slot Discovery (`/public`)
- `GET /public/:username/:slug` — Fetch public event info, host profile, and metadata.
- `GET /public/:username/:slug/slots?date=YYYY-MM-DD&timezone=IANA_TZ` — Compute real-time available time slots for chosen date in target timezone.
- `POST /public/:username/:slug/book` — Book open slot (`{ date, startTime, inviteeName, inviteeEmail, inviteeTimezone, notes }`).
- `GET /public/bookings/:bookingUid` — Retrieve confirmed booking details.
- `POST /public/bookings/:bookingUid/cancel` — Cancel booking with reason.
- `POST /public/bookings/:bookingUid/reschedule` — Reschedule booking to new slot.

### 5. Host Bookings Dashboard (`/bookings`)
- `GET /bookings?status=CONFIRMED&from=...&to=...` — Host bookings list.
- `GET /bookings/:id` — Booking details with invitee response.
- `POST /bookings/:id/cancel` — Host cancels booking.
