# System Requirements Specification: Restaurant Menu Management

## 1. Executive Summary

The **Restaurant Menu Management** system is an end-to-end culinary administration platform and public digital menu solution. Designed for single-location eateries and multi-concept hospitality groups, it streamlines menu engineering, category organization, ingredient & allergen transparency, schedule-based menu switching, variant modifier pricing, object storage image management, and table-ready QR code generation.

## 2. Functional Requirements

### 2.1 Restaurant Profile & Multi-Tenant Authentication
- Operator registration, authentication (JWT/bcrypt), and restaurant profile configuration (name, slug, currency, address, contact, operating hours).
- Custom URL slug for restaurant digital storefront (e.g. `/m/bistro-parisien`).

### 2.2 Multi-Menu Management & Availability Schedules
- Support for multiple independent menus per restaurant (e.g., Breakfast, Lunch, Dinner, Weekend Brunch, Late Night, Catering).
- Scheduling engine: Define active days of week (0-6) and operating time ranges (e.g., `07:00` to `11:30`).
- Menu activation toggles (Draft, Published, Archived).

### 2.3 Category Architecture
- Hierarchical menu categories (e.g., Starters, Wood-Fired Mains, Plant-Based, Sides, Craft Cocktails).
- Sort order and display prioritization.

### 2.4 Menu Item Engineering & Pricing
- Full CRUD operations for menu items.
- Item attributes: Title, culinary description, preparation time (minutes), calorie count, display badge (e.g. "Chef's Special", "New", "Bestseller").
- Pricing rules: Base price, discount/promotional price, and taxable flag.
- Stock availability toggle: Instant "86'd" (Sold Out / Out of Stock) marking without deleting the item.

### 2.5 Item Variants & Customization Modifiers
- Variant groups (e.g., "Size", "Protein Choice", "Spice Level").
- Modifier options with price deltas (e.g., "Regular: +$0.00", "Large: +$3.50", "Add Truffle Oil: +$2.00").
- Minimum and maximum selection constraints (e.g. "Choose exactly 1" or "Choose up to 3").

### 2.6 Dietary, Ingredient & Allergen Transparency
- Structured allergen tags: Gluten, Dairy, Eggs, Tree Nuts, Peanuts, Shellfish, Soy, Sesame.
- Dietary badges: Vegan, Vegetarian, Halal, Kosher, Keto-friendly.
- Full ingredient listing for customer safety.

### 2.7 S3-Compatible Object Storage Image Management
- Integrated media management with S3 / MinIO object storage.
- Local fallback storage handler for self-hosted and zero-dependency deployments.
- Automatic image URL binding for dish hero photos.

### 2.8 QR Code Tabletop Menu Generator
- Generate vector SVG and high-resolution PNG QR codes pointing directly to the restaurant's public digital menu URL.
- Table-number query parameter support (e.g. `/m/bistro?table=14`).
- One-click export for table stand printing.

### 2.9 Public Customer-Facing Digital Menu
- Responsive, mobile-first guest interface optimized for smartphone browser scanning.
- Instant search across menu items and ingredients.
- Category jump navigation and active allergen filters.
- Interactive dish modal showing full descriptions, dietary flags, and customization options.

### 2.10 Admin Operations Dashboard
- High-level KPIs: Active menus, total live items, sold-out items, active categories.
- Quick-toggle item availability switches.

## 3. Non-Functional Requirements
- Independent PostgreSQL database schema with Prisma ORM.
- Decoupled ports: Backend on port 4002, Frontend on port 3002.
- 100% automated test coverage across unit, integration, API contract, and security tiers.
