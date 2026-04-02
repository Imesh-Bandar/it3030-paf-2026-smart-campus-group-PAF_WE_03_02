# Smart Campus Operations Hub — Full Development Task List

> **Stack:** Spring Boot 3.3 · Java 17 · React 18 · PostgreSQL 14 · TypeScript · Vite
> **Total Estimated Time:** ~360 hours | 4 Engineers | 9 Weeks

---

## Progress Overview

| Phase | Description                          | Status         |
| ----- | ------------------------------------ | -------------- |
| 0     | Project Initialization               | 🟨 In Progress |
| 1     | Authentication Module (Google OAuth) | 🟨 In Progress |
| 2     | Facilities & Asset Catalogue         | ⬜ Not Started |
| 3     | Booking Management System            | ⬜ Not Started |
| 4     | Maintenance & Incident Ticketing     | ⬜ Not Started |
| 5     | Notifications & Dashboard            | ⬜ Not Started |
| 6     | Testing, Security & Optimization     | ⬜ Not Started |

---

## PHASE 0 — PROJECT INITIALIZATION (Week 1)

### 0.1 Repository & Monorepo Setup

- [x] Setup monorepo structure: `/backend` (Spring Boot), `/frontend` (React + Vite)
- [x] Configure `.gitignore`, `.editorconfig`, `.prettierrc`, `.eslintrc.json`
- [x] Setup Husky v9 pre-commit hooks with lint-staged
- [ ] Initialize Git repository and create `main` and `develop` branches
- [x] Create environment variable templates:

#### Backend `.env.example`:

```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/smartcampus
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# Google OAuth 2.0
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback

# Server
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173

# File Upload
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5MB
```

#### Frontend `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_GOOGLE_CLIENT_ID=
```

---

### 0.2 Backend (Spring Boot 3) Initialization

- [x] Generate Spring Boot 3.3 project using Spring Initializr with dependencies:
  - Spring Web
  - Spring Security 6
  - Spring Data JPA
  - PostgreSQL Driver
  - OAuth2 Client
  - Validation
  - Lombok
  - Spring Boot DevTools
- [x] Configure `application.yml` with profiles (dev, test, prod)
- [x] Setup project structure:

  ```text
  backend/src/main/java/edu/sliit/smartcampus/
  ├── config/          DatabaseConfig, SecurityConfig, WebConfig, JwtConfig
  ├── security/        JwtAuthenticationFilter, JwtTokenProvider, OAuth2SuccessHandler
  ├── controller/      FacilityController, BookingController, TicketController, AuthController, NotificationController
  ├── service/         FacilityService, BookingService, TicketService, AuthService, NotificationService
  ├── repository/      UserRepository, ResourceRepository, BookingRepository, TicketRepository, NotificationRepository
  ├── model/           User, Resource, Booking, Ticket, Notification (JPA entities)
  ├── dto/             Request/Response DTOs for each module
  ├── exception/       GlobalExceptionHandler, custom exception classes
  ├── util/            ResponseUtil, PaginationUtil
  └── SmartCampusApplication.java
  ```

- [x] Configure PostgreSQL connection in `application.yml`:

  ```yaml
  spring:
    datasource:
      url: ${DATABASE_URL}
      username: ${DATABASE_USERNAME}
      password: ${DATABASE_PASSWORD}
      driver-class-name: org.postgresql.Driver
    jpa:
      hibernate:
        ddl-auto: validate
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
          format_sql: true
      show-sql: true
  ```

- [x] Configure HikariCP connection pool:

  ```yaml
  spring:
    datasource:
      hikari:
        minimum-idle: 5
        maximum-pool-size: 20
        idle-timeout: 30000
        connection-timeout: 20000
  ```

- [x] Create `GlobalExceptionHandler` with `@ControllerAdvice`
- [x] Create custom exception classes: `ResourceNotFoundException`, `ValidationException`, `ConflictException`
- [x] Setup logging with Logback configuration
- [x] Create health check endpoint: `GET /api/health` → returns status, timestamp

---

### 0.3 Frontend (React + Vite) Initialization

- [x] Create React 18 project with Vite: `npm create vite@latest frontend -- --template react-ts`
- [x] Install core dependencies:

  ```bash
  npm install @tanstack/react-query axios zustand react-router-dom
  npm install react-hook-form @hookform/resolvers zod
  npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
  npm install class-variance-authority clsx tailwind-merge lucide-react
  npm install react-hot-toast date-fns
  ```

- [x] Install dev dependencies:

  ```bash
  npm install -D @types/node tailwindcss postcss autoprefixer
  npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
  npm install -D prettier prettier-plugin-tailwindcss eslint-plugin-react
  ```

- [x] Initialize Tailwind CSS v4:

  ```bash
  npx tailwindcss init -p
  ```

- [x] Configure `tailwind.config.js` with custom theme

- [x] Project structure:

  ```text
  frontend/src/
  ├── app/
  │   ├── login/
  │   ├── facilities/
  │   │   ├── page.tsx
  │   │   └── [id]/
  │   │       └── page.tsx
  │   ├── bookings/
  │   │   ├── page.tsx
  │   │   └── [id]/
  │   │       └── page.tsx
  │   ├── tickets/
  │   │   ├── page.tsx
  │   │   └── [id]/
  │   │       └── page.tsx
  │   ├── admin/
  │   │   ├── facilities/
  │   │   ├── bookings/
  │   │   ├── tickets/
  │   │   └── users/
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── ui/             Button, Card, Dialog, Input, Select, Badge, Skeleton
  │   ├── layout/         Navbar, Sidebar, Footer, Container
  │   ├── facilities/     FacilityCard, FacilityFilters, AvailabilityCalendar
  │   ├── bookings/       BookingForm, BookingCard, StatusBadge
  │   └── tickets/        TicketForm, TicketCard, TicketBoard
  ├── hooks/
  │   ├── useFacilities.ts
  │   ├── useBookings.ts
  │   ├── useTickets.ts
  │   ├── useNotifications.ts
  │   └── useAuth.ts
  ├── lib/
  │   ├── axios.ts
  │   ├── queryClient.ts
  │   └── utils.ts
  ├── stores/
  │   ├── authStore.ts
  │   └── notificationStore.ts
  ├── services/
  │   ├── api/
  │   │   ├── facilityApi.ts
  │   │   ├── bookingApi.ts
  │   │   ├── ticketApi.ts
  │   │   ├── authApi.ts
  │   │   └── notificationApi.ts
  │   └── types/
  │       ├── facility.ts
  │       ├── booking.ts
  │       ├── ticket.ts
  │       └── user.ts
  ├── main.tsx
  └── App.tsx
  ```

- [x] Setup Axios instance (`src/lib/axios.ts`):
  - baseURL from `VITE_API_BASE_URL`
  - JWT interceptor (reads from localStorage)
  - Auto-refresh on 401
  - Error handling

- [x] Setup React Query client (`src/lib/queryClient.ts`):
  - staleTime: 5 minutes
  - retry: 1
  - refetchOnWindowFocus: false

- [x] Setup Zustand auth store (`src/stores/authStore.ts`):
  - `user`, `accessToken`, `isAuthenticated`
  - `setAuth()`, `clearAuth()`, `updateUser()`
  - Persist to localStorage

- [x] Setup React Router v6 with protected routes

### 0.3.1 Phase 0 Fixes Applied (2026-04-02)

- [x] Fixed backend OAuth dependency artifact in `backend/pom.xml` (`spring-boot-starter-oauth2-client`)
- [x] Added H2 test dependency for test profile compatibility
- [x] Activated `test` profile in backend context test and added test OAuth registration in `application.yml`
- [x] Updated Tailwind v4 PostCSS plugin usage in `frontend/postcss.config.js`

---

### 0.4 Database Setup — PostgreSQL

- [x] Install PostgreSQL 14+ locally OR setup cloud PostgreSQL (e.g., Neon, Supabase, Railway)
- [x] Create database: `smartcampus` (Neon environment uses existing `neondb` database)
- [x] Run schema migration script: `psql -U postgres -d smartcampus -f docs/03_database_schema.sql`
- [x] Verify tables created: Should have 11 tables
- [x] Verify seed data:
  - Admin user: `admin@smartcampus.edu` ✓
  - Technician user: `technician@smartcampus.edu` ✓
  - 5 sample resources ✓

- [x] Configure Spring Boot to use database:

  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/smartcampus
      username: postgres
      password: your_password
  ```

- [x] Test database connection on Spring Boot startup

### 0.4.1 Phase 0 DB Execution Notes (2026-04-02)

- [x] Applied schema from the migration SQL block in `docs/03_database_schema.sql` to Neon PostgreSQL
- [x] Verified table count in `public` schema: `11`
- [x] Verified seed rows: `users=2`, `resources=5`
- [x] Verified seeded emails exist: `admin@smartcampus.edu`, `technician@smartcampus.edu`
- [x] Verified Spring Boot can initialize Hikari + JPA with Neon connection settings in `dev` profile

---

### 0.5 Google OAuth 2.0 Setup

- [ ] Create Google Cloud Project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Configure authorized redirect URI: `http://localhost:8080/auth/callback`
- [ ] Copy `Client ID` and `Client Secret` to backend `.env`
- [x] Configure Spring Security OAuth2 client in `application.yml`:

  ```yaml
  spring:
    security:
      oauth2:
        client:
          registration:
            google:
              client-id: ${GOOGLE_CLIENT_ID}
              client-secret: ${GOOGLE_CLIENT_SECRET}
              redirect-uri: '{baseUrl}/auth/callback'
              scope:
                - openid
                - profile
                - email
          provider:
            google:
              authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
              token-uri: https://oauth2.googleapis.com/token
              user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
              user-name-attribute: sub
  ```

### 0.5.1 Phase 0.5 Backend Implementation Notes (2026-04-02)

- [x] Added environment-driven Google redirect URI support in `backend/src/main/resources/application.yml`
- [x] Wired custom OAuth2 success handler in `backend/src/main/java/edu/sliit/smartcampus/config/SecurityConfig.java`
- [x] Updated OAuth2 success redirect to use configurable `app.frontend-url` in `backend/src/main/java/edu/sliit/smartcampus/security/OAuth2SuccessHandler.java`
- [x] Confirmed `.env.example` already includes required OAuth variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`)

---

## PHASE 1 — AUTHENTICATION MODULE (Week 1-2)

> **Goal:** Implement Google OAuth 2.0 authentication with JWT-based session management

### 1.1 Backend — Spring Security Configuration

- [x] Create `SecurityConfig` class extending `SecurityFilterChain`:
  - Configure CORS for frontend origin
  - Disable CSRF for stateless API
  - Configure session management: STATELESS
  - Set up OAuth2 login with custom success handler
  - Configure public endpoints: `/auth/**`, `/api/v1/resources` (GET)
  - Require authentication for all other endpoints

- [x] Create `JwtTokenProvider` utility class:
  - Method: `generateAccessToken(User user)` → returns JWT (1 hour expiry)
  - Method: `generateRefreshToken(User user)` → returns JWT (7 days expiry)
  - Method: `validateToken(String token)` → boolean
  - Method: `getUserIdFromToken(String token)` → UUID
  - Method: `getClaimsFromToken(String token)` → Claims

- [x] Create `JwtAuthenticationFilter` extends `OncePerRequestFilter`:
  - Extract Bearer token from `Authorization` header
  - Validate token using `JwtTokenProvider`
  - Set `SecurityContext` with authenticated user

- [x] Create `OAuth2AuthenticationSuccessHandler`:
  - On successful Google login:
    - Extract user email, name, avatar from OAuth2User
    - Check if user exists in database (by email)
    - If new user: create `User` record with role = `USER`
    - Generate access token and refresh token
    - Store refresh token in database
    - Redirect to frontend with tokens in query params

---

### 1.2 Backend — Auth Controller & Service

- [x] **GET /auth/google** — Redirect to Google OAuth consent screen
  - Spring Security handles this automatically
  - Configure redirect URI in `SecurityConfig`

- [x] **GET /auth/callback** — OAuth callback endpoint
  - Handled by `OAuth2AuthenticationSuccessHandler`
  - Returns: Redirect to `${FRONTEND_URL}/login?access_token=...&refresh_token=...`

- [x] **POST /auth/refresh** — Refresh access token
  - Extract refresh token from request body or cookie
  - Validate refresh token (check expiry, revoked status)
  - Generate new access token
  - Generate new refresh token (token rotation)
  - Revoke old refresh token in database
  - Return: `{ "accessToken": "...", "refreshToken": "..." }`

- [x] **GET /auth/me** — Get current user profile
  - Extract user ID from JWT in `SecurityContext`
  - Fetch user from database
  - Return: `UserDto` (id, email, fullName, role, avatarUrl, createdAt)

- [x] **POST /auth/logout** — Logout (revoke refresh token)
  - Extract refresh token from request
  - Mark refresh token as revoked in database
  - Return: `204 No Content`

---

### 1.3 Backend — JPA Entities & Repositories

- [x] Create `User` entity:
  - Map to `users` table
  - Fields: id, email, fullName, avatarUrl, role, status, emailVerified, googleId, timestamps
  - Add `@Enumerated` for role and status enums

- [x] Create `RefreshToken` entity:
  - Map to `refresh_tokens` table
  - Fields: id, userId, token, expiresAt, revoked, createdAt, revokedAt
  - Add `@ManyToOne` relationship to `User`

- [x] Create `UserRepository` extends `JpaRepository<User, UUID>`:
  - Method: `Optional<User> findByEmail(String email)`
  - Method: `Optional<User> findByGoogleId(String googleId)`
  - Method: `boolean existsByEmail(String email)`

- [x] Create `RefreshTokenRepository` extends `JpaRepository<RefreshToken, UUID>`:
  - Method: `Optional<RefreshToken> findByToken(String token)`
  - Method: `void deleteByUserId(UUID userId)`
  - Method: `List<RefreshToken> findByUserIdAndRevokedFalse(UUID userId)`

---

### 1.4 Frontend — Auth Pages & Flow

- [x] `/login` page:
  - Display "Sign in with Google" button
  - On click: Redirect to `${API_BASE_URL}/auth/google`
  - After OAuth callback redirect, extract tokens from URL query params
  - Store access token in memory (Zustand store)
  - Store refresh token in httpOnly cookie (if backend supports) OR localStorage
  - Redirect to `/facilities` (home page)

- [x] Create `useAuth` hook wrapping Zustand auth store:
  - `login()` — Initiate Google OAuth flow
  - `logout()` — Call logout API, clear tokens, redirect to login
  - `refreshAccessToken()` — Call refresh API, update access token
  - `getUser()` — Fetch current user from `/auth/me`

- [x] Setup Axios interceptor for token refresh:
  - On 401 response: Attempt token refresh
  - If refresh succeeds: Retry original request with new token
  - If refresh fails: Clear auth state, redirect to login

- [x] Create `ProtectedRoute` component:
  - Check `isAuthenticated` from auth store
  - If not authenticated: Redirect to `/login`
  - If authenticated: Render children

- [x] Update React Router routes:
  - Public: `/login`
  - Protected: All other routes wrapped in `<ProtectedRoute>`

---

### 1.5 Backend — Role-Based Access Control (RBAC)

- [x] Create `@PreAuthorize` annotations for role checks:
  - USER: Can access own bookings, tickets, notifications
  - ADMIN: Can manage all resources, bookings, tickets, users
  - TECHNICIAN: Can view and update assigned tickets

- [ ] Example controller method protection:

  ```java
  @GetMapping("/admin/bookings/all")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<BookingDto>> getAllBookings(...) {
    // Admin only
  }

  @PutMapping("/tickets/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
  public ResponseEntity<TicketDto> updateTicketStatus(...) {
    // Admin or Technician only
  }
  ```

- [x] Create service layer authorization checks:
  - In `BookingService`: Verify user can only cancel own bookings (unless ADMIN)
  - In `TicketService`: Verify only reporter/ADMIN/assigned technician can view ticket details

---

### 1.6 Frontend — Role-Based UI

- [x] Create `useRole()` hook:
  - Returns current user's role
  - Helper methods: `isAdmin()`, `isTechnician()`, `isUser()`

- [x] Conditionally render navigation items based on role:
  - USER: Facilities, My Bookings, My Tickets, Notifications
  - ADMIN: + Admin Dashboard, Manage Users, Pending Approvals
  - TECHNICIAN: + My Assigned Tickets

- [x] Hide/disable actions based on role:
  - "Create Resource" button: ADMIN only
  - "Approve Booking" button: ADMIN only
  - "Assign Technician" button: ADMIN only

### 1.7 Phase 1 Implementation Notes (2026-04-02)

- [x] Implemented JWT token generation/validation with claims in `backend/src/main/java/edu/sliit/smartcampus/security/JwtTokenProvider.java`
- [x] Implemented auth token refresh rotation, `/auth/me`, and logout revocation in `backend/src/main/java/edu/sliit/smartcampus/service/AuthService.java` and `backend/src/main/java/edu/sliit/smartcampus/controller/AuthController.java`
- [x] Added persisted `refresh_tokens` entity/repository and expanded `users` entity to schema-aligned fields
- [x] Implemented OAuth success redirect with `access_token` + `refresh_token` query parameters and httpOnly refresh cookie
- [x] Added frontend auth store refresh-token support, login callback processing, and role-aware protected routes
- [x] Added email/password authentication APIs: `POST /auth/register` and `POST /auth/login` with validation and BCrypt hashing
- [x] Added local credential storage service (`user_credentials`) linked to `users` for password-based authentication
- [x] Upgraded auth UX to a landing-first Login/Register tabbed page with submit flows and Google sign-in/register action
- [x] Updated routing so landing auth page is available at `/` and protected app pages require authentication
- [x] Aligned OAuth callback path to `/auth/callback` in backend config and environment defaults for Google registration/login compatibility

---

## PHASE 2 — FACILITIES & ASSET CATALOGUE (Week 2-3)

> **Goal:** Implement facility browsing, search, filtering, and CRUD (admin)

### 2.1 Backend — Resource Entity & Repository

- [ ] Create `Resource` entity:
  - Map to `resources` table
  - Fields: id, name, type, capacity, status, location, description, amenities, specifications, thumbnailUrl, timestamps
  - Add `@Enumerated` for type and status enums
  - Add `@ElementCollection` for amenities array

- [ ] Create `ResourceImage` entity:
  - Map to `resource_images` table
  - Fields: id, resourceId, url, caption, isPrimary, displayOrder, createdAt
  - Add `@ManyToOne` relationship to `Resource`

- [ ] Create `ResourceRepository` extends `JpaRepository<Resource, UUID>`:
  - Method: `Page<Resource> findByDeletedAtIsNull(Pageable pageable)` — Active resources only
  - Method: `Page<Resource> findByTypeAndDeletedAtIsNull(ResourceType type, Pageable pageable)`
  - Method: `Page<Resource> findByStatusAndDeletedAtIsNull(ResourceStatus status, Pageable pageable)`
  - Method: `Page<Resource> findByCapacityBetweenAndDeletedAtIsNull(int min, int max, Pageable pageable)`
  - Method: `@Query("SELECT r FROM Resource r WHERE r.deletedAt IS NULL AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :q, '%')))") Page<Resource> searchByKeyword(String q, Pageable pageable)`

---

### 2.2 Backend — Facility APIs (Public & Admin)

- [ ] **GET /api/v1/resources** — List all facilities (PUBLIC)
  - Query params: `page`, `size`, `sort`, `type`, `status`, `capacity_min`, `capacity_max`, `q`
  - Response: `Page<ResourceDto>`
  - Filter logic: Apply all non-null query params
  - Full-text search: Use `searchByKeyword()` if `q` param present
  - Sort options: name, capacity, createdAt

- [ ] **GET /api/v1/resources/{id}** — Get facility details (PUBLIC)
  - Path param: `id` (UUID)
  - Response: `ResourceDetailDto` (includes images, amenities, specifications, availability summary)
  - Increment view count (optional)

- [ ] **POST /api/v1/resources** — Create facility (ADMIN)
  - Request body: `CreateResourceRequest` (name, type, capacity, location, description, amenities, specifications)
  - Validation: `@Valid` annotation + JSR-380 validators
  - Create resource with status = AVAILABLE
  - Set `createdBy` to current authenticated user
  - Response: `ResourceDto` with 201 Created

- [ ] **PUT /api/v1/resources/{id}** — Update facility (ADMIN)
  - Path param: `id` (UUID)
  - Request body: `UpdateResourceRequest` (partial update)
  - Validation: `@Valid` annotation
  - Check if resource exists and not deleted
  - If status changed to UNDER_MAINTENANCE: Check for active bookings, send notifications
  - Response: Updated `ResourceDto`

- [ ] **DELETE /api/v1/resources/{id}** — Soft-delete facility (ADMIN)
  - Path param: `id` (UUID)
  - Check for active bookings (PENDING or CONFIRMED status)
  - If active bookings exist: Return `409 Conflict` with error message
  - If no blockers: Set `deletedAt` to current timestamp
  - Create notifications for users with bookings (if any)
  - Response: `204 No Content`

- [ ] **GET /api/v1/resources/{id}/availability** — Check availability (AUTH)
  - Path param: `id` (UUID)
  - Query params: `from` (ISO date), `to` (ISO date)
  - Validation: `to` date must be within 90 days of `from`
  - Fetch all bookings for resource in date range with status = CONFIRMED
  - Build availability slots per day (8:00 AM - 5:00 PM by default)
  - Mark occupied vs available time slots
  - Response: `AvailabilityResponse` with daily breakdown

---

### 2.3 Frontend — Facility Catalogue Page

- [ ] `/facilities` page (PUBLIC):
  - Fetch facilities using `useFacilities` hook (React Query)
  - Display facility cards in grid layout (3 columns desktop, 1 column mobile)
  - Implement search bar with debounced input (500ms delay)
  - Implement filter sidebar:
    - Type dropdown (LAB, CLASSROOM, HALL, EQUIPMENT, SPORTS_FACILITY)
    - Status checkboxes (AVAILABLE, UNDER_MAINTENANCE)
    - Capacity range slider (min-max)
  - URL query params sync for shareable filters
  - Pagination at bottom (page size: 20)

- [ ] `FacilityCard` component:
  - Display: thumbnail, name, type badge, capacity, location
  - Availability indicator (green dot = available, red = occupied, yellow = maintenance)
  - "View Details" button → navigates to `/facilities/[id]`

- [ ] `FacilityFilters` component:
  - Controlled form inputs
  - "Apply Filters" and "Clear Filters" buttons
  - Update URL query params on filter change

---

### 2.4 Frontend — Facility Detail Page

- [ ] `/facilities/[id]` page (PUBLIC):
  - Fetch facility detail using `useFacility(id)` hook
  - Layout: Image gallery (left) + Details panel (right)
  - Image gallery: Primary image large, thumbnails below
  - Details panel:
    - Facility name (h1)
    - Type and status badges
    - Capacity, location
    - Full description
    - Amenities list with icons
    - Specifications (if JSONB has data)
  - "Book Now" button (AUTH required) → opens booking modal
  - Availability calendar section (next 7 days)

- [ ] `AvailabilityCalendar` component:
  - Fetch availability using `useFacilityAvailability(id, from, to)` hook
  - Display daily calendar with time slots
  - Color-code slots: Green (available), Red (occupied), Gray (past)
  - On slot click: Pre-fill booking form with selected time

---

### 2.5 Frontend — Admin Facility Management

- [ ] `/admin/facilities` page (ADMIN only):
  - Data table with columns: Name, Type, Capacity, Status, Actions
  - Filter by type and status
  - Search by name
  - Actions: Edit, Delete
  - "Add New Facility" button → navigates to `/admin/facilities/new`

- [ ] `/admin/facilities/new` page:
  - Form with fields: name, type, capacity, location, description, amenities (multi-select)
  - Image upload (single thumbnail, max 5MB)
  - Form validation using react-hook-form + Zod
  - Submit → POST `/api/v1/resources`
  - On success: Show toast, redirect to facility detail page

- [ ] `/admin/facilities/[id]/edit` page:
  - Pre-populate form with existing data
  - Allow editing all fields except `id` and `createdAt`
  - Submit → PUT `/api/v1/resources/{id}`
  - On success: Show toast, redirect to facility detail page

---

## PHASE 3 — BOOKING MANAGEMENT SYSTEM (Week 3-4)

> **Goal:** Implement booking request, approval workflow, conflict detection, and user/admin booking views

### 3.1 Backend — Booking Entity & Repository

- [ ] Create `Booking` entity:
  - Map to `bookings` table
  - Fields: id, resourceId, userId, startTime, endTime, purpose, status, rejectionReason, cancellationReason, approvedBy, rejectedBy, cancelledBy, timestamps
  - Add `@ManyToOne` relationships to `Resource` and `User`
  - Add `@Enumerated` for status enum

- [ ] Create `BookingStatusHistory` entity:
  - Map to `booking_status_history` table
  - Fields: id, bookingId, oldStatus, newStatus, changedBy, notes, createdAt
  - Add `@ManyToOne` relationship to `Booking`

- [ ] Create `BookingRepository` extends `JpaRepository<Booking, UUID>`:
  - Method: `Page<Booking> findByUserId(UUID userId, Pageable pageable)` — User's bookings
  - Method: `Page<Booking> findByStatus(BookingStatus status, Pageable pageable)` — Filter by status
  - Method: `@Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.status IN ('CONFIRMED', 'PENDING') AND ((b.startTime < :endTime AND b.endTime > :startTime))") List<Booking> findConflictingBookings(UUID resourceId, LocalDateTime startTime, LocalDateTime endTime)` — Conflict detection

---

### 3.2 Backend — Booking APIs (User & Admin)

- [ ] **POST /api/v1/bookings** — Create booking request (USER/ADMIN)
  - Request body: `CreateBookingRequest` (resourceId, startTime, endTime, purpose)
  - Validation:
    - startTime must be at least 24 hours in future
    - endTime must be after startTime
    - Duration between 30 minutes and 8 hours
    - Resource must exist and status = AVAILABLE
  - Check for conflicts using `findConflictingBookings()`
  - If conflict found: Return `409 Conflict` with conflicting booking details + suggestions
  - If no conflict: Create booking with status = PENDING
  - Create notification for ADMIN users
  - Response: `BookingDto` with 201 Created

- [ ] **GET /api/v1/bookings** — List own bookings (USER)
  - Query params: `page`, `size`, `sort`, `status`, `from`, `to`
  - Fetch bookings where `userId` matches authenticated user
  - Apply filters if provided
  - Response: `Page<BookingDto>`

- [ ] **GET /api/v1/bookings/{id}** — Get booking details (USER/ADMIN)
  - Path param: `id` (UUID)
  - Authorization: User can view own booking, ADMIN can view any booking
  - Fetch booking with related resource and user data
  - Fetch status history
  - Response: `BookingDetailDto`

- [ ] **PUT /api/v1/bookings/{id}/cancel** — Cancel booking (USER/ADMIN)
  - Path param: `id` (UUID)
  - Request body: `CancelBookingRequest` (reason - optional for USER, required for ADMIN)
  - Authorization: User can cancel own booking, ADMIN can cancel any
  - Validation: Booking status must be PENDING or CONFIRMED
  - Update status to CANCELLED
  - Set `cancelledBy` to current user
  - Store cancellation reason
  - Create status history entry
  - Create notification for booking owner (if cancelled by admin)
  - Response: `BookingDto`

- [ ] **GET /api/v1/bookings/all** — List all bookings (ADMIN)
  - Query params: `page`, `size`, `sort`, `status`, `resourceId`, `userId`, `from`, `to`
  - Fetch all bookings with filters applied
  - Response: `Page<BookingDto>`

- [ ] **PUT /api/v1/bookings/{id}/approve** — Approve booking (ADMIN)
  - Path param: `id` (UUID)
  - Validation: Booking status must be PENDING
  - Check for conflicts again (in case another admin approved a conflicting booking)
  - If conflict: Return `409 Conflict`
  - If no conflict: Update status to CONFIRMED
  - Set `approvedBy` and `approvedAt`
  - Create status history entry
  - Create notification for booking requester
  - Send confirmation email (optional)
  - Response: `BookingDto`

- [ ] **PUT /api/v1/bookings/{id}/reject** — Reject booking (ADMIN)
  - Path param: `id` (UUID)
  - Request body: `RejectBookingRequest` (reason - required)
  - Validation: Booking status must be PENDING, reason not empty
  - Update status to REJECTED
  - Set `rejectedBy`, `rejectedAt`, and `rejectionReason`
  - Create status history entry
  - Create notification for booking requester with rejection reason
  - Send rejection email (optional)
  - Response: `BookingDto`

---

### 3.3 Backend — Booking Service Logic

- [ ] Create `BookingService`:
  - Method: `createBooking(CreateBookingRequest request, User currentUser)`:
    - Validate input
    - Check resource availability
    - Detect conflicts
    - Create booking with status = PENDING
    - Notify admins

  - Method: `approveBooking(UUID bookingId, User admin)`:
    - Fetch booking
    - Verify status = PENDING
    - Re-check conflicts (concurrency safety)
    - Update to CONFIRMED
    - Create history entry
    - Notify requester

  - Method: `rejectBooking(UUID bookingId, String reason, User admin)`:
    - Fetch booking
    - Verify status = PENDING
    - Update to REJECTED
    - Store reason
    - Create history entry
    - Notify requester

  - Method: `cancelBooking(UUID bookingId, String reason, User currentUser)`:
    - Fetch booking
    - Verify authorization (owner or admin)
    - Verify status (PENDING or CONFIRMED)
    - Update to CANCELLED
    - Store reason and canceller
    - Create history entry
    - Notify affected users

---

### 3.4 Frontend — Booking Form & Flow

- [ ] Create `BookingModal` component:
  - Opened from facility detail page "Book Now" button
  - Form fields:
    - Date picker (minimum: tomorrow, maximum: 90 days ahead)
    - Start time dropdown (30-minute intervals, 8:00 AM - 5:00 PM)
    - End time dropdown
    - Purpose textarea (required)
  - Real-time validation:
    - End time must be after start time
    - Duration check (30 min - 8 hours)
  - On submit: Call `POST /api/v1/bookings`
  - On success: Show success toast, close modal, redirect to "My Bookings"
  - On conflict error: Show conflict details with alternative time suggestions
  - On validation error: Display inline field errors

---

### 3.5 Frontend — My Bookings Page (User)

- [ ] `/bookings` page:
  - Fetch bookings using `useBookings()` hook
  - Display bookings grouped by status tabs:
    - PENDING (awaiting approval)
    - CONFIRMED (approved)
    - CANCELLED
    - REJECTED
    - COMPLETED (past bookings)
  - Each booking card shows:
    - Resource name and thumbnail
    - Date and time
    - Purpose
    - Status badge with color coding
    - Action buttons: "Cancel" (if PENDING or CONFIRMED), "View Details"
  - Filter by date range
  - Search by resource name

- [ ] `BookingCard` component:
  - Display booking summary
  - "Cancel" button with confirmation dialog
  - "View Details" link → navigates to `/bookings/[id]`

---

### 3.6 Frontend — Booking Detail Page

- [ ] `/bookings/[id]` page:
  - Fetch booking detail using `useBooking(id)` hook
  - Display:
    - Resource info with image
    - Booking details (date, time, purpose)
    - Current status with badge
    - Status history timeline (if available)
    - Rejection/cancellation reason (if applicable)
  - Action buttons:
    - "Cancel Booking" (if status = PENDING or CONFIRMED and user is owner)
    - "View Resource" link

---

### 3.7 Frontend — Admin Booking Management

- [ ] `/admin/bookings/pending` page (ADMIN only):
  - Fetch pending bookings using `useBookings({ status: 'PENDING' })` hook
  - Display pending bookings queue
  - Each booking card shows:
    - User name and email
    - Resource name
    - Requested date/time
    - Purpose
    - "Approve" and "Reject" buttons
  - On "Approve" click: Confirm, then call PUT `/api/v1/bookings/{id}/approve`
  - On "Reject" click: Open modal with reason input, then call PUT `/api/v1/bookings/{id}/reject`
  - On success: Show toast, refresh list

- [ ] `/admin/bookings/all` page (ADMIN only):
  - Data table with columns: User, Resource, Date/Time, Status, Actions
  - Filter by status, resource, user
  - Search by user name or resource name
  - Actions: View, Approve (if PENDING), Reject (if PENDING), Cancel

---

## PHASE 4 — MAINTENANCE & INCIDENT TICKETING (Week 4-5)

> **Goal:** Implement ticket reporting, assignment, status tracking, and comment threads

### 4.1 Backend — Ticket Entities & Repositories

- [ ] Create `Ticket` entity:
  - Map to `tickets` table
  - Fields: id, ticketNumber, resourceId, reporterId, assignedTo, title, description, severity, category, status, assignedBy, timestamps
  - Add `@ManyToOne` relationships to `Resource` and `User` (reporter, assignedTo, assignedBy)
  - Add `@Enumerated` for severity, category, status enums

- [ ] Create `TicketEvidence` entity:
  - Map to `ticket_evidence` table
  - Fields: id, ticketId, url, uploadedBy, uploadedAt
  - Add `@ManyToOne` relationship to `Ticket`

- [ ] Create `TicketComment` entity:
  - Map to `ticket_comments` table
  - Fields: id, ticketId, userId, text, createdAt
  - Add `@ManyToOne` relationships

- [ ] Create `TicketStatusHistory` entity:
  - Map to `ticket_status_history` table
  - Fields: id, ticketId, oldStatus, newStatus, changedBy, notes, createdAt

- [ ] Create `TicketRepository` extends `JpaRepository<Ticket, UUID>`:
  - Method: `Page<Ticket> findByReporterId(UUID reporterId, Pageable pageable)`
  - Method: `Page<Ticket> findByAssignedTo(UUID technicianId, Pageable pageable)`
  - Method: `Page<Ticket> findByStatus(TicketStatus status, Pageable pageable)`
  - Method: `Page<Ticket> findBySeverity(TicketSeverity severity, Pageable pageable)`
  - Method: `Optional<Ticket> findByTicketNumber(String ticketNumber)`

- [ ] Create `TicketCommentRepository`, `TicketEvidenceRepository`, `TicketStatusHistoryRepository`

---

### 4.2 Backend — Ticket APIs

- [ ] **POST /api/v1/tickets** — Report incident (USER/ADMIN/TECH)
  - Request body: `CreateTicketRequest` (resourceId, title, description, severity, category)
  - Validation: All fields required, title 5-100 chars, description 20-1000 chars
  - Generate unique ticket number: `TICK-YYYYMMDD-NNNN` (e.g., TICK-20260327-0012)
  - Create ticket with status = OPEN, reporterId = current user
  - If severity = HIGH or CRITICAL: Create notifications for all ADMIN and TECHNICIAN users
  - Response: `TicketDto` with 201 Created

- [ ] **POST /api/v1/tickets/evidence** — Upload evidence (USER/ADMIN/TECH)
  - Content-Type: `multipart/form-data`
  - Form fields: `ticketId` (UUID), `file` (image file)
  - Validation: File size max 5MB, format JPEG/PNG
  - Save file to server/cloud storage
  - Create `TicketEvidence` record with URL
  - Response: `{ "ticketId": "...", "evidenceUrl": "...", "uploadedAt": "..." }`

- [ ] **GET /api/v1/tickets** — List tickets (USER/ADMIN/TECH)
  - Query params: `page`, `size`, `sort`, `status`, `severity`, `category`, `resourceId`, `assignedTo`
  - Authorization:
    - USER: Only own tickets (where reporterId = current user)
    - TECHNICIAN: Only assigned tickets (where assignedTo = current user)
    - ADMIN: All tickets
  - Apply filters
  - Response: `Page<TicketDto>`

- [ ] **GET /api/v1/tickets/{id}** — Get ticket details (USER/ADMIN/TECH)
  - Path param: `id` (UUID)
  - Authorization: Reporter, ADMIN, or assigned TECHNICIAN only
  - Fetch ticket with related resource, reporter, technician
  - Fetch evidence, comments, status history
  - Response: `TicketDetailDto`

- [ ] **PUT /api/v1/tickets/{id}/status** — Update ticket status (ADMIN/TECH)
  - Path param: `id` (UUID)
  - Request body: `UpdateTicketStatusRequest` (status, notes)
  - Authorization: ADMIN or assigned TECHNICIAN only
  - Validation:
    - Status transitions: OPEN → IN_PROGRESS → RESOLVED
    - Cannot go backward from RESOLVED
  - Update ticket status
  - If new status = RESOLVED: Set `resolvedAt` timestamp
  - Create status history entry
  - Create notification for reporter
  - Response: `TicketDto`

- [ ] **PUT /api/v1/tickets/{id}/assign** — Assign technician (ADMIN)
  - Path param: `id` (UUID)
  - Request body: `AssignTechnicianRequest` (technicianId)
  - Validation:
    - technicianId must reference a user with TECHNICIAN role
    - Ticket status must be OPEN or IN_PROGRESS
  - Update `assignedTo` field
  - Set `assignedBy` and `assignedAt`
  - Create notification for assigned technician
  - Send email to technician (optional)
  - Response: `TicketDto`

- [ ] **POST /api/v1/tickets/{id}/comments** — Add comment (USER/ADMIN/TECH)
  - Path param: `id` (UUID)
  - Request body: `AddCommentRequest` (text)
  - Authorization: Reporter, ADMIN, or assigned TECHNICIAN only
  - Validation: Text 5-500 chars
  - Create comment record
  - Create notifications:
    - If commenter is ADMIN/TECH: Notify reporter
    - If commenter is reporter: Notify assigned technician (if any) and ADMIN
  - Response: `TicketCommentDto` with 201 Created

---

### 4.3 Backend — Ticket Service Logic

- [ ] Create `TicketService`:
  - Method: `createTicket(CreateTicketRequest request, User reporter)`:
    - Validate input
    - Generate ticket number
    - Create ticket with OPEN status
    - If severity HIGH/CRITICAL: Notify all admins and technicians

  - Method: `updateTicketStatus(UUID ticketId, TicketStatus newStatus, String notes, User currentUser)`:
    - Fetch ticket
    - Verify authorization (ADMIN or assigned tech)
    - Validate status transition
    - Update status
    - Create history entry
    - Notify reporter

  - Method: `assignTechnician(UUID ticketId, UUID technicianId, User admin)`:
    - Fetch ticket and technician user
    - Verify technician role
    - Update assignment
    - Notify technician

  - Method: `addComment(UUID ticketId, String text, User commenter)`:
    - Fetch ticket
    - Verify authorization
    - Create comment
    - Notify relevant users

---

### 4.4 Frontend — Report Ticket Page

- [ ] `/tickets/new` page:
  - Form fields:
    - Facility (searchable dropdown)
    - Title (required, max 100 chars)
    - Description (textarea, required, max 1000 chars)
    - Severity (dropdown: LOW, MEDIUM, HIGH, CRITICAL)
    - Category (dropdown: ELECTRICAL, PLUMBING, EQUIPMENT, CLEANING, OTHER)
    - Photo evidence (file upload, optional, max 5 images)
  - Form validation using react-hook-form + Zod
  - Submit → POST `/api/v1/tickets`
  - On success:
    - Show success toast with ticket number
    - Redirect to ticket detail page

---

### 4.5 Frontend — My Tickets Page (User)

- [ ] `/tickets` page:
  - Fetch tickets using `useTickets()` hook
  - Display tickets in list/card view
  - Each ticket card shows:
    - Ticket number
    - Title
    - Facility name
    - Status badge (OPEN/IN_PROGRESS/RESOLVED)
    - Severity indicator (color-coded)
    - Created date
  - Filter by status and severity
  - Search by title or description
  - Click card → navigate to `/tickets/[id]`

---

### 4.6 Frontend — Ticket Detail Page

- [ ] `/tickets/[id]` page:
  - Fetch ticket detail using `useTicket(id)` hook
  - Display:
    - Ticket number and status badge
    - Facility info with link
    - Title and description
    - Severity and category badges
    - Reporter info
    - Assigned technician (if any)
    - Photo evidence gallery
    - Status history timeline
    - Comment thread (oldest first)
  - Comment section:
    - Textarea for new comment
    - "Add Comment" button
    - Display all comments with user name and timestamp
  - Action buttons (role-based):
    - "Update Status" (ADMIN/assigned TECH)
    - "Assign Technician" (ADMIN)

---

### 4.7 Frontend — Admin Ticket Board (Kanban)

- [ ] `/admin/tickets` page (ADMIN/TECH):
  - Kanban board view with 3 columns:
    - OPEN (red)
    - IN_PROGRESS (yellow)
    - RESOLVED (green)
  - Fetch all tickets using `useTickets()` hook
  - Each ticket card shows: ticket number, title, facility, severity, assigned tech avatar
  - Drag-and-drop between columns to change status:
    - On drop: Show confirmation modal with notes input
    - On confirm: Call PUT `/api/v1/tickets/{id}/status`
  - Filter by severity, category, facility, assigned tech
  - Switch to list view option (data table)

---

## PHASE 5 — NOTIFICATIONS & DASHBOARD (Week 5-6)

> **Goal:** Implement notification system, real-time updates, and role-based dashboards

### 5.1 Backend — Notification Entity & Repository

- [ ] Create `Notification` entity:
  - Map to `notifications` table
  - Fields: id, userId, type, title, message, entityType, entityId, isRead, readAt, createdAt
  - Add `@ManyToOne` relationship to `User`
  - Add `@Enumerated` for type and entityType enums

- [ ] Create `NotificationRepository` extends `JpaRepository<Notification, UUID>`:
  - Method: `Page<Notification> findByUserId(UUID userId, Pageable pageable)`
  - Method: `Page<Notification> findByUserIdAndIsRead(UUID userId, boolean isRead, Pageable pageable)`
  - Method: `long countByUserIdAndIsReadFalse(UUID userId)` — Unread count
  - Method: `void markAllAsReadByUserId(UUID userId)`

---

### 5.2 Backend — Notification Service

- [ ] Create `NotificationService`:
  - Method: `createNotification(UUID userId, NotificationType type, String title, String message, String entityType, UUID entityId)`:
    - Create notification record
    - Optionally: Send real-time notification via WebSocket/SSE (future enhancement)

  - Method: `getUserNotifications(UUID userId, boolean unreadOnly, Pageable pageable)`:
    - Fetch notifications for user
    - Filter by read status if specified
    - Return paginated results

  - Method: `markAsRead(UUID notificationId, UUID userId)`:
    - Fetch notification
    - Verify ownership
    - Update `isRead` = true, `readAt` = now

  - Method: `markAllAsRead(UUID userId)`:
    - Update all notifications for user where `isRead` = false

  - Method: `getUnreadCount(UUID userId)`:
    - Return count of unread notifications

---

### 5.3 Backend — Notification Triggers

- [ ] Integrate notification creation into existing services:

  **BookingService:**
  - When booking created (PENDING): Notify all ADMIN users
  - When booking approved: Notify booking requester
  - When booking rejected: Notify booking requester (include reason in message)
  - When booking cancelled by admin: Notify booking owner

  **TicketService:**
  - When ticket created with severity HIGH/CRITICAL: Notify all ADMIN and TECHNICIAN users
  - When technician assigned: Notify assigned technician
  - When ticket status changed: Notify ticket reporter
  - When comment added: Notify relevant users (reporter, assigned tech, admins)

  **ResourceService:**
  - When resource deleted with active bookings: Notify affected booking owners

---

### 5.4 Backend — Notification APIs

- [ ] **GET /api/v1/notifications** — List notifications (AUTH)
  - Query params: `page`, `size`, `read` (boolean, optional)
  - Fetch notifications for authenticated user
  - Response: `Page<NotificationDto>` with `unreadCount` in response wrapper

- [ ] **PUT /api/v1/notifications/read-all** — Mark all as read (AUTH)
  - Update all notifications for user
  - Response: `{ "updatedCount": 5, "message": "All notifications marked as read" }`

- [ ] **PUT /api/v1/notifications/{id}/read** — Mark single as read (AUTH)
  - Path param: `id` (UUID)
  - Verify ownership
  - Update notification
  - Response: `NotificationDto`

---

### 5.5 Frontend — Notification Bell & Dropdown

- [ ] Add notification bell icon in Navbar:
  - Fetch unread count using `useNotifications({ unreadOnly: true })` hook
  - Display count badge if > 0
  - Polling strategy: Refetch every 30 seconds
  - On click: Open notification dropdown

- [ ] Notification dropdown:
  - List last 5 unread notifications
  - Each notification shows:
    - Icon (based on type)
    - Title and message preview
    - Timestamp (relative, e.g., "2 hours ago")
    - Click → mark as read, navigate to related entity
  - "Mark All Read" button
  - "View All Notifications" link → `/notifications`

---

### 5.6 Frontend — Notifications Page

- [ ] `/notifications` page:
  - Fetch all notifications using `useNotifications()` hook
  - Tabs: "All", "Unread"
  - Each notification card shows:
    - Icon, title, full message
    - Timestamp
    - Link to related entity
    - "Mark as Read" button (if unread)
  - Pagination at bottom

---

### 5.7 Frontend — User Dashboard

- [ ] `/dashboard` page (USER):
  - Summary cards:
    - My Bookings (count by status: PENDING, CONFIRMED)
    - My Tickets (count by status: OPEN, IN_PROGRESS)
    - Unread Notifications
  - Upcoming bookings list (next 7 days)
  - Recent tickets (last 5)
  - Quick actions: "Book a Facility", "Report an Issue"

---

### 5.8 Frontend — Admin Dashboard

- [ ] `/admin/dashboard` page (ADMIN):
  - KPI cards:
    - Total Users (count)
    - Total Resources (count)
    - Pending Bookings (count)
    - Open Tickets (count)
  - Charts (using Recharts):
    - Booking requests per day (last 30 days) — Line chart
    - Tickets by severity — Pie chart
    - Resource utilization — Bar chart
  - Recent activity feed:
    - Last 10 bookings (any status)
    - Last 10 tickets (any status)
  - Quick actions: "Approve Bookings", "Assign Tickets", "Add Resource"

---

### 5.9 Frontend — Technician Dashboard

- [ ] `/tech/dashboard` page (TECHNICIAN):
  - Summary cards:
    - Assigned Tickets (count by status)
    - Resolved This Week (count)
  - My assigned tickets list with filters
  - Ticket stats: Total resolved, average resolution time
  - Quick actions: "View My Tickets"

---

## PHASE 6 — TESTING, SECURITY & OPTIMIZATION (Week 6-7)

### 6.1 Backend Testing

- [ ] Setup JUnit 5 and Mockito for unit testing
- [ ] Unit tests for all service classes:
  - `AuthServiceTest`
  - `BookingServiceTest` (conflict detection logic)
  - `TicketServiceTest` (status transitions)
  - `NotificationServiceTest`

- [ ] Integration tests for all controllers:
  - Use `@SpringBootTest` and `MockMvc`
  - Test all endpoints with different roles
  - Test authorization (403 when role insufficient)
  - Test validation errors (400 responses)

- [ ] Repository tests:
  - Test custom queries
  - Test pagination

- [ ] Test edge cases:
  - Booking conflict scenarios
  - Concurrent booking approval (race condition)
  - Invalid status transitions
  - Token expiry and refresh flow

---

### 6.2 Frontend Testing

- [ ] Setup Vitest for unit testing
- [ ] Setup React Testing Library
- [ ] Unit tests for hooks:
  - `useAuth.test.ts`
  - `useBookings.test.ts`
  - `useTickets.test.ts`

- [ ] Component tests:
  - `BookingCard.test.tsx`
  - `TicketCard.test.tsx`
  - `FacilityCard.test.tsx`

- [ ] Integration tests:
  - Login flow
  - Booking creation flow
  - Ticket reporting flow

---

### 6.3 Security Hardening

- [ ] **Rate Limiting:**
  - Install `bucket4j-spring-boot-starter`
  - Configure rate limits:
    - Auth endpoints: 5 requests / 15 minutes
    - API endpoints: 100 requests / 1 minute
  - Return `429 Too Many Requests` when exceeded

- [ ] **Input Validation:**
  - Ensure all DTOs use `@Valid` with JSR-380 validators
  - Custom validators for business rules (e.g., date ranges)

- [ ] **SQL Injection Protection:**
  - Use JPA parameterized queries (already handled by Spring Data)
  - Audit all `@Query` annotations for proper parameter binding

- [ ] **CORS Configuration:**
  - Whitelist only production frontend domain
  - No wildcard `*` in production

- [ ] **HTTPS Enforcement:**
  - Configure Spring Boot to redirect HTTP → HTTPS in production
  - Use TLS 1.2+ only

- [ ] **JWT Security:**
  - Use RS256 algorithm (asymmetric keys) instead of HS256
  - Keep access token expiry short (1 hour)
  - Implement refresh token rotation

- [ ] **Audit Logging:**
  - Log all sensitive operations:
    - User login/logout
    - Booking approval/rejection
    - Ticket assignment
    - Resource deletion
  - Use Spring AOP for cross-cutting audit logging

---

### 6.4 Performance Optimization

- [ ] **Database:**
  - Verify all indexes are created (see schema)
  - Run `EXPLAIN ANALYZE` on slow queries
  - Add missing indexes for frequently queried columns
  - Configure Hibernate batch fetching: `spring.jpa.properties.hibernate.jdbc.batch_size=20`

- [ ] **API Response Time:**
  - Add `@Cacheable` annotations for rarely-changing data (e.g., resource list)
  - Configure Spring Cache with Caffeine or Redis
  - Cache duration: 5 minutes

- [ ] **Frontend:**
  - Implement lazy loading for routes (React.lazy())
  - Optimize images: Compress thumbnails, use WebP format
  - Bundle size analysis: `npm run build -- --analyze`
  - Target bundle size: < 400 KB gzipped

- [ ] **Connection Pooling:**
  - Verify HikariCP settings:
    - minimum-idle: 5
    - maximum-pool-size: 20
    - connection-timeout: 20000
    - idle-timeout: 30000

---

### 6.5 Deployment Preparation

- [ ] **Backend Dockerfile:**

  ```dockerfile
  FROM eclipse-temurin:17-jdk-alpine AS build
  WORKDIR /workspace/app

  COPY mvnw .
  COPY .mvn .mvn
  COPY pom.xml .
  RUN ./mvnw dependency:go-offline

  COPY src src
  RUN ./mvnw package -DskipTests

  FROM eclipse-temurin:17-jre-alpine
  VOLUME /tmp
  ARG JAR_FILE=target/*.jar
  COPY --from=build /workspace/app/${JAR_FILE} app.jar
  ENTRYPOINT ["java","-jar","/app.jar"]
  ```

- [ ] **Frontend Dockerfile:**

  ```dockerfile
  FROM node:18-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **Docker Compose:**

  ```yaml
  version: '3.8'
  services:
    postgres:
      image: postgres:14-alpine
      environment:
        POSTGRES_DB: smartcampus
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: ${DB_PASSWORD}
      volumes:
        - postgres_data:/var/lib/postgresql/data
      ports:
        - '5432:5432'

    backend:
      build: ./backend
      environment:
        DATABASE_URL: jdbc:postgresql://postgres:5432/smartcampus
        DATABASE_USERNAME: postgres
        DATABASE_PASSWORD: ${DB_PASSWORD}
        JWT_SECRET: ${JWT_SECRET}
        GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
        GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      ports:
        - '8080:8080'
      depends_on:
        - postgres

    frontend:
      build: ./frontend
      environment:
        VITE_API_BASE_URL: http://backend:8080/api/v1
      ports:
        - '80:80'
      depends_on:
        - backend

  volumes:
    postgres_data:
  ```

- [ ] **CI/CD Pipeline (GitHub Actions):**

  ```yaml
  name: CI/CD Pipeline

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main]

  jobs:
    backend-test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-java@v3
          with:
            java-version: '17'
        - name: Run tests
          run: cd backend && ./mvnw test

    frontend-test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
        - name: Install and test
          run: cd frontend && npm ci && npm test

    deploy:
      needs: [backend-test, frontend-test]
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v3
        - name: Deploy to production
          run: echo "Deploy to cloud provider"
  ```

---

### 6.6 Database Migration & Backup

- [ ] Setup Flyway for database migrations:
  - Add dependency: `flyway-core`
  - Create `db/migration` directory
  - Baseline migration: `V1__Initial_Schema.sql`

- [ ] Backup strategy:
  - Daily automated backups using `pg_dump`
  - Retention: 30 days
  - Store in cloud storage (S3, Google Cloud Storage)

---

### 6.7 Monitoring & Logging

- [ ] Setup application monitoring:
  - Spring Boot Actuator endpoints: `/actuator/health`, `/actuator/metrics`
  - Prometheus + Grafana (optional)

- [ ] Centralized logging:
  - Configure Logback with JSON format
  - Log levels: INFO in production, DEBUG in dev
  - Log rotation: Daily, max 30 files

---

## DELIVERABLES CHECKLIST

| #   | Deliverable                                               | Status |
| --- | --------------------------------------------------------- | ------ |
| 1   | Database schema (11 tables, seed data)                    | ⬜     |
| 2   | Spring Boot backend foundation                            | ⬜     |
| 3   | React frontend foundation (Vite + TypeScript)             | ⬜     |
| 4   | Google OAuth 2.0 authentication + JWT                     | ⬜     |
| 5   | Facility catalogue (public + admin CRUD)                  | ⬜     |
| 6   | Booking management (request, approve, conflict detection) | ⬜     |
| 7   | Ticket system (report, assign, status tracking, comments) | ⬜     |
| 8   | Notification system (in-app notifications)                | ⬜     |
| 9   | Role-based dashboards (User, Admin, Technician)           | ⬜     |
| 10  | Unit + integration tests (backend + frontend)             | ⬜     |
| 11  | Security hardening (rate limiting, HTTPS, audit logs)     | ⬜     |
| 12  | Docker containerization                                   | ⬜     |
| 13  | CI/CD pipeline (GitHub Actions)                           | ⬜     |
| 14  | Production deployment                                     | ⬜     |

---

## PROJECT TIMELINE

### Week 1: Project Initialization

- Day 1-2: Repository setup, environment config, Google OAuth setup
- Day 3-4: Backend + frontend scaffolding
- Day 5: Database schema creation and seed data

### Week 2: Authentication Module

- Day 1-3: Backend auth implementation (OAuth + JWT)
- Day 4-5: Frontend auth pages and flows

### Week 3: Facilities & Bookings (Part 1)

- Day 1-2: Facility entity, repository, APIs
- Day 3-4: Booking entity, repository, conflict detection
- Day 5: Frontend facility catalogue

### Week 4: Bookings (Part 2)

- Day 1-2: Booking approval workflow
- Day 3-4: Frontend booking forms and "My Bookings"
- Day 5: Admin booking management

### Week 5: Maintenance Ticketing

- Day 1-2: Ticket entity, repository, APIs
- Day 3-4: Frontend ticket reporting and detail pages
- Day 5: Admin ticket board (Kanban)

### Week 6: Notifications & Dashboards

- Day 1-2: Notification system backend
- Day 3-4: Frontend notifications + User dashboard
- Day 5: Admin + Technician dashboards

### Week 7: Testing & Security

- Day 1-2: Unit + integration tests
- Day 3-4: Security hardening + performance optimization
- Day 5: Code review and refactoring

### Week 8-9: Deployment & Documentation

- Day 1-2: Docker + CI/CD setup
- Day 3-4: Production deployment
- Day 5: Final testing + documentation

---

**End of Task List**
