# System Requirements Specification: URL Shortener

## 1. Executive Summary

The **URL Shortener** is an enterprise-grade, high-performance link management platform. It allows individuals and teams to transform long URLs into concise, branded short links, generate customized QR codes, configure redirect behaviors, protect links with passwords, set expiration dates, and monitor deep click analytics (geographic, device, browser, and referrer data).

## 2. Functional Requirements

### 2.1 Authentication & User Management
- Secure user registration and login with bcrypt password hashing (minimum 10 rounds).
- JWT (JSON Web Token) bearer authentication with configurable TTL.
- Role-based privileges: Anonymous users can generate basic public links; authenticated users access persistent management dashboards, custom slugs, detailed analytics, domain configuration, and password protection.
- Secure user profile retrieval and API key provisioning for programmatic automation.

### 2.2 Link Shortening & Aliasing
- High-entropy cryptographic slug generation (default 6-8 alphanumeric characters, base62 URL-safe).
- Support for user-defined custom aliases (e.g. `/my-campaign-2026`).
- Validation of alias uniqueness per domain.
- Collision avoidance strategy with retry limit.
- Automatic protocol normalization (`http://` vs `https://`).

### 2.3 Redirection Engine & Cache Strategy
- Instant resolution with HTTP status codes: `301 Moved Permanently`, `302 Found`, `307 Temporary Redirect`, or `308 Permanent Redirect`.
- Multi-tier caching architecture:
  - Redis cache stores hot short link metadata (`id`, `targetUrl`, `isActive`, `expiresAt`, `passwordHash`).
  - Cache invalidation on link update or deletion.
  - In-memory cache fallback when Redis is absent.
- Password protection check before redirection: prompt user if link is flagged private/protected.
- Expiration check: Return HTTP 410 (Gone) or HTTP 404 (Not Found) if link is expired.

### 2.4 QR Code Engine
- Generate clean vector SVG and high-resolution PNG QR codes for any shortened link.
- Configurable error correction levels (L, M, Q, H).
- Instant preview and one-click download.

### 2.5 Analytics & Telemetry Engine
- Asynchronous click tracking without adding latency to the redirect pipeline.
- Captured metrics:
  - Timestamp (UTC).
  - Anonymized client IP (SHA-256 hashed with salt to respect privacy).
  - Geolocation approximation (Country, Region, City).
  - Referrer domain / source (e.g. Direct, Google, Twitter, LinkedIn).
  - User Agent parsing: Browser family, OS family, Device category (Desktop, Mobile, Tablet, Bot).
- Analytical aggregation:
  - Total and unique clicks over selectable time windows (last 24h, 7 days, 30 days, all-time).
  - Top referrers, browsers, operating systems, and countries.

### 2.6 Link Management Dashboard
- Paginated, searchable, and filterable table of user links.
- Inline status toggling (Active / Disabled).
- Edit target destination URL, description, expiration timestamp, and redirect code.
- Soft and permanent delete options.

### 2.7 Custom Domains
- Register custom hostnames (e.g. `go.mybrand.com`).
- Domain verification status tracking (Pending / Verified).
- Default fallback URL routing for root domain visits.

### 2.8 Security, Abuse Prevention & Rate Limiting
- Token-bucket rate limiting on link creation and redirect endpoints.
- Phishing and malware URL blocklist: validation against unsafe protocol schemes (`javascript:`, `data:`, `file:`, `ftp:`).
- Self-referencing loop prevention: Disallows targets that point back to the shortener's own host or aliases.
- Hostile payload rejection with strict schema validation.

## 3. Non-Functional Requirements
- **Latency**: Core redirect endpoint response latency < 25ms when cached in Redis.
- **Portability**: Completely decoupled and standalone with independent Docker Compose setup and zero cross-repo dependencies.
- **Testability**: Minimum 85% automated test coverage across unit, integration, API contract, and security tiers.
