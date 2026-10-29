# Mount Manor SaaS Platform Modernization

Transform the legacy PHP web application of Mount Manor Hotel (mountmanor.com, Chennai) into a modern, responsive, SEO-optimized React frontend powered by an API-first backend architecture designed for multi-tenant SaaS operation and third-party developer integration.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural decisions below have been confirmed based on your requirements and clarification:

- **SaaS Architecture**: Full white-label hospitality SaaS for independent hotel chains, featuring Mount Manor Chennai as the showcase flagship tenant (`tenant_id: "mount-manor"`).
- **Third-Party Developer Integration**: API-first RESTful architecture with an interactive developer portal, live API sandbox, Swagger/OpenAPI 3.0 specification viewer, and API key provisioning (`Bearer sk_live_...`).
- **Core Guest Services**: Comprehensive modernized booking engines for boutique guest rooms & suites, banquet hall and conference events, and *Delicia* multi-cuisine restaurant table reservations.
- **Visual Design**: Warm boutique luxury aesthetic with deep slate neutral canvas (`#0F172A`), rich warm champagne/gold accents (`#D4AF37`), editorial typography pairings, and generous spatial rhythm.
- **SEO & Discoverability**: High-performance metadata, OpenGraph cards, Twitter preview cards, and Schema.org JSON-LD microdata (`Hotel`, `LodgingBusiness`, `FoodEstablishment`).

---

## 1. Overview & Core Concept

### What It Does
Mount Manor Modernize is a dual-tier hospitality application:
1. **Flagship Guest Experience**: A high-converting, modern, mobile-responsive web portal for Mount Manor (opposite Officers Training Academy, GST Road, St. Thomas Mount, Chennai), featuring real-time room availability, banquet hall inquiries, restaurant table booking, and proximity guides to Chennai International Airport and Nanganallur Metro.
2. **Multi-Tenant SaaS & Developer Platform**: An enterprise hospitality backend engine where hotel operators can manage multiple properties and third-party developers (OTAs, travel agents, mobile app creators) can access RESTful APIs, generate scoped API keys, test endpoints in an interactive sandbox, and integrate booking workflows into their custom frontends.

### Target Audience & Personas
- **Hotel Guests & Business Travelers**: Guests visiting Chennai seeking quick airport transit, business-class rooms, dining reservations, or conference halls.
- **Hotel Operations & SaaS Administrators**: Managers overseeing room inventories, dynamic pricing, banquet requests, and multi-property tenant configurations.
- **Third-Party Frontend Developers**: Software engineers and partner agencies building custom mobile apps, kiosks, or travel portal widgets using Mount Manor's open API.

### Key Value
- Replaces legacy monolithic PHP pages with lightning-fast React components and structured RESTful endpoints.
- Decouples UI from the database, enabling headless hospitality architecture.
- Full parity with modern SEO standards (Google search snippet rich results, social cards, semantic HTML5).

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PRIMARY NAVIGATION                              │
│   [Flagship Guest Portal]  │  [SaaS Hotel Admin]  │  [Developer API Portal] │
└──────────────────────┬──────────────────────┬──────────────────────┬────────┘
                       │                      │                      │
                       ▼                      ▼                      ▼
           ┌──────────────────────┐┌──────────────────────┐┌──────────────────┐
           │ Guest Booking Engine ││ Multi-Tenant Console ││ API & Sandbox    │
           │ • Room Search & Stay ││ • Property Switcher  ││ • Interactive UI │
           │ • Banquet Hall Events││ • Room & Rate Config ││ • Key Management │
           │ • Delicia Dining     ││ • Live Reservations  ││ • OpenAPI / Docs │
           │ • Airport Transit Map││ • Tenant Settings    ││ • Code Snippets  │
           └──────────────────────┘└──────────────────────┘└──────────────────┘
```

1. **Guest Booking Flow**:
   - Guests browse room categories (Standard, Deluxe, Executive Suite) with transparent nightly tariffs, room dimensions, high-resolution photography, and amenity lists.
   - Live availability check with instant date pickers, guest counters, add-on selections (airport shuttle, complimentary breakfast buffet), and instant confirmation voucher generation.
   - Dedicated interactive tabs for Banquet / Conference Hall booking and Delicia Restaurant table booking.

2. **SaaS Multi-Property Console**:
   - Switch between Mount Manor Chennai and demo hospitality tenants or create new hotel properties.
   - Inspect live room occupancy, booking pipelines, revenue metrics, and property branding settings.

3. **3rd-Party Developer Portal & API Sandbox**:
   - Live endpoint tester for `GET /api/v1/properties`, `GET /api/v1/rooms`, `POST /api/v1/bookings`, `POST /api/v1/dining/reserve`.
   - Real-time API key generator with permission scopes (`read:rooms`, `write:bookings`).
   - Copy-paste ready code snippets in cURL, JavaScript (Fetch / Axios), and PHP/Laravel Guzzle.

### Visual Identity & Theme
- **Aesthetic Direction**: Contemporary boutique luxury. Clean architectural lines, refined high-contrast editorial hierarchy, subtle hairline dividers, and zero visual clutter.
- **Color Palette (60-30-10 Rule)**:
  - *60% Dominant Canvas*: Deep Obsidian Slate (`#0B0F17`) in dark modes and Crisp Warm Alabaster (`#FBFBF9`) in light surfaces.
  - *30% Structural Surfaces*: Tailored Card Surfaces (`#131B2B` dark / `#FFFFFF` light) with subtle hairline borders (`rgba(226, 232, 240, 0.8)` / `rgba(255, 255, 255, 0.08)`).
  - *10% Accent Accentuation*: Warm Champagne Gold (`#D4AF37` / `#E5C07B`) for call-to-actions, active indicators, and luxury badges.
- **Typography & Scale**:
  - Display & Headings: `Plus Jakarta Sans` with bold weights and tight tracking for high-end hospitality presence.
  - Body & Reading: `DM Sans` for high legibility across mobile and desktop.
  - Numerals & Endpoints: `JetBrains Mono` / tabular numerals (`tabular-nums`) for currency rates, dates, timestamps, and API paths.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Architecture Pattern (Headless API-First with Full-Stack Express/TSX Server)
- **Chosen Approach**: Build an API-first backend adhering strictly to Laravel RESTful conventions (`/api/v1/*`, standardized JSON:API envelope with `data`, `meta`, and `error` payloads), served via the app's Node/Express backend, accompanied by an interactive API explorer and a React client.
- **Why**: Allows third-party developers to immediately test real HTTP requests, inspect payloads, generate keys, and build custom frontends today, while providing Mount Manor with a turnkey guest booking frontend.
- **Alternatives Considered**: Static mock JSON files inside React were rejected because they don't allow true third-party HTTP requests, token authentication, or real server responses.

### Decision 2: Multi-Tenant Isolation Strategy
- **Chosen Approach**: Tenant resolution via HTTP header (`X-Tenant-ID`), query parameter (`?tenant=mount-manor`), or Bearer token metadata. Data stores isolate properties, rooms, pricing, and bookings per tenant.
- **Why**: Perfectly aligns with Laravel multi-tenancy packages (e.g., Tenancy for Laravel, Stancl) and allows Mount Manor to serve as Tenant #1 while allowing new hotels to be onboarded instantly.

### Decision 3: SEO & Social Share Architecture
- **Chosen Approach**: Full Schema.org JSON-LD microdata (`Hotel`, `LodgingBusiness`, `PostalAddress`, `GeoCoordinates`, `FoodEstablishment`), complete OpenGraph and Twitter card metadata, semantic HTML5 landmarks, and canonical URL handling.
- **Why**: Essential for Mount Manor's commercial search ranking in Chennai (airport hotel searches, GST Road conference hall queries, St. Thomas Mount accommodations).

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND LAYER                            │
│                                                                           │
│   ┌────────────────────┐  ┌───────────────────────┐  ┌────────────────┐   │
│   │ Mount Manor Guest  │  │  SaaS Tenant Console  │  │ Developer Hub  │   │
│   │ Booking Engine     │  │  • Property Manager   │  │ • API Explorer │   │
│   │ • Rooms & Suites   │  │  • Room Inventory     │  │ • Swagger Spec │   │
│   │ • Banquet & Events │  │  • Booking Pipeline   │  │ • Key Manager  │   │
│   │ • Delicia Dining   │  │  • Rate Management    │  │ • Code Samples │   │
│   └─────────┬──────────┘  └───────────┬───────────┘  └───────┬────────┘   │
└─────────────┼─────────────────────────┼──────────────────────┼────────────┘
              │                         │                      │
              ▼                         ▼                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & CLIENT SERVICE LAYER                     │
│    • Tenant Resolver (X-Tenant-ID)  • API Key Bearer Authentication       │
│    • Rate Limiting & Validation     • Standardized JSON Envelope          │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND (LARAVEL-COMPATIBLE)                   │
│                                                                           │
│   /api/v1/properties          GET / POST                                  │
│   /api/v1/rooms               GET (filters: dates, guests, property)      │
│   /api/v1/bookings            POST (room reservation engine)              │
│   /api/v1/banquets/reserve    POST (event & hall reservation)             │
│   /api/v1/dining/reserve      POST (Delicia table reservation)            │
│   /api/v1/developer/keys      GET / POST / DELETE (API tokens)            │
│   /api/v1/docs/openapi.json   GET (Full OpenAPI 3.0 specification)        │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    IN-MEMORY MULTI-TENANT REPOSITORY                      │
│   • Tenants (Mount Manor, Grand Horizon, Skyline Suites)                  │
│   • Inventory (Standard, Deluxe, Executive Suites, Boardrooms)            │
│   • Bookings, Restaurant Tables, Banquet Inquiries, API Keys              │
└───────────────────────────────────────────────────────────────────────────┘
```

### Key Data Entities
1. **Property (Tenant)**: `id`, `name`, `code`, `address`, `city`, `phone`, `email`, `checkInTime`, `checkOutTime`, `amenities`, `currency`, `coordinates`.
2. **Room**: `id`, `tenantId`, `name`, `type`, `pricePerNight`, `capacity`, `bedType`, `sizeSqFt`, `amenities`, `images`, `availableUnits`.
3. **Booking**: `id`, `tenantId`, `roomTypeId`, `guestName`, `guestEmail`, `guestPhone`, `checkIn`, `checkOut`, `nights`, `totalAmount`, `status`, `referenceCode`.
4. **DiningReservation**: `id`, `tenantId`, `guestName`, `guestEmail`, `guestPhone`, `date`, `timeSlot`, `guestsCount`, `seatingPreference`, `status`.
5. **BanquetReservation**: `id`, `tenantId`, `hallName`, `eventType`, `guestName`, `contact`, `date`, `guestCount`, `cateringOption`, `status`.
6. **ApiKey**: `id`, `tenantId`, `key`, `name`, `permissions`, `createdAt`, `lastUsedAt`, `status`.

---

## Verification Plan

### Automated & Integration Checks
- Verify backend API endpoints with automated health check routes.
- Execute full compile check (`compile_applet`) ensuring TypeScript zero-error clean build.
- Validate SEO tags and JSON-LD schema formatting in HTML and React head tags.

### Manual Verification Flows
1. **Guest Booking**:
   - Select check-in and check-out dates, pick a room, fill in guest details, and complete a live booking to verify confirmation voucher and reservation code generation.
   - Test Delicia table reservation and banquet inquiry submissions.
2. **SaaS Multi-Tenant Management**:
   - Switch properties in the SaaS dashboard and confirm room inventories and bookings change dynamically per tenant.
   - Add a new room or toggle availability.
3. **Developer API Portal**:
   - Generate a new third-party API key in the Developer portal.
   - Execute live requests in the interactive API Sandbox (`GET /api/v1/rooms`, `POST /api/v1/bookings`) using the key and observe the exact JSON response and status codes.
   - Inspect the OpenAPI 3.0 specification viewer.
