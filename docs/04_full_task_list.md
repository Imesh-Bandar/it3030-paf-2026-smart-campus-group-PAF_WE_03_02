# 📋 IT3030 – Smart Campus Operations Hub

## Complete Task List (Group Coursework)

> **Stack:** Spring Boot REST API + React Frontend + **PostgreSQL**
> **Team:** 4 Developers  
> **Deadline:** 27th April 2026
> **Last Updated:** 10th April 2026 ✅

---

## ✅ WORK COMPLETED (Codebase Snapshot - 10 April 2026)

### 🧱 Core Setup

- [x] Backend scaffolded with Spring Boot + JPA + Spring Security + PostgreSQL/H2 profiles
- [x] Frontend scaffolded with React + Vite + routing + state stores/hooks
- [x] Basic API client layer created (`auth`, `facility`, `booking`, `ticket`, `notification`)
- [x] Frontend `.env.example` added
- [x] Global exception handler and CORS configuration added

### 🔐 Auth & Security Progress

- [x] `User` entity with role/status and `UserRepository`
- [x] Role enum implemented (`STUDENT`, `STAFF`, `TECHNICIAN`, `ADMIN`)
- [x] JWT flow implemented (`AuthController`, `AuthService`, `JwtAuthenticationFilter`)
- [x] OAuth2 Google success handler integrated
- [x] Login/Register frontend page connected to auth APIs
- [x] Authentication module completed (OAuth + JWT + login/register + protected backend auth routes)
- [x] Role-based backend authorization active (`@PreAuthorize` + role checks)
- [x] Role-based frontend route guard completion done (`<ProtectedRoute>` + role-aware unauthorized redirects)
- [x] Multi-role onboarding implemented (`STUDENT`, `STAFF`, `TECHNICIAN` registration + backend role mapping)
- [ ] Google signup/signin first-class flow pending (new user provisioning + returning user login journey)
- [x] Role-specific dashboard routing implemented (post-login redirect by role)
- [x] User management admin endpoints implemented (`/api/v1/admin/users`, role/status updates)
- [ ] Auth integration tests pending

### 🆕 Authentication Update Summary (10 April 2026)

- [x] Backend registration now accepts role selection for `STUDENT`, `STAFF`, `TECHNICIAN`
- [x] Backend blocks self-registration as `ADMIN`
- [x] OAuth new-user provisioning defaults to `STUDENT`
- [x] Added admin-only user management APIs for listing users and updating role/status
- [x] Frontend registration UI now includes role selector (Student/Staff/Technician)
- [x] Frontend login/register and OAuth flows now redirect users to role-specific landing pages
- [x] Frontend protected routes now redirect unauthorized users to their own allowed dashboard route

### 🧩 Module Implementation Status

| Module                       | Current Status | Notes                                                                                                       |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| Facilities (Dev 1)           | 🟡 In Progress | Entity/repository/service/controller and basic UI scaffolds exist; CRUD logic + full endpoints pending      |
| Bookings (Dev 2)             | 🟡 In Progress | Entity/repository/service/controller and UI placeholders exist; conflict logic + workflow endpoints pending |
| Tickets (Dev 3)              | 🟡 In Progress | Entity/repository/service/controller and UI placeholders exist; comments/attachments workflows pending      |
| Notifications & Auth (Dev 4) | 🟡 In Progress | Authentication core complete; multi-role onboarding + role dashboards + notification integration pending    |

### 🧪 Testing Progress

- [x] Base Spring Boot context test exists
- [ ] Module-level unit tests pending
- [ ] Repository/controller integration tests pending

### 📚 Documentation Progress

- [x] Quick Start Guide (`QUICK_START_GUIDE.md`)
- [x] Developer Assignment Matrix (`DEVELOPER_ASSIGNMENTS.md`)
- [x] Navigation Index (`README_DOCUMENTATION.md`)
- [x] Full coursework task list and milestone plan

---

## 📋 Overview

This coursework involves building a **Smart Campus Operations Hub** with 4 developers working on distinct modules:

- **Module A:** Facilities & Assets Catalogue (Dev 1)
- **Module B:** Booking Management (Dev 2)
- **Module C:** Maintenance & Incident Ticketing (Dev 3)
- **Module D+E:** Notifications & Authentication (Dev 4)

### Primary User Types

- **Student**: Books campus resources, reports incidents, tracks own requests/tickets
- **Staff**: Books and manages departmental needs, raises operational incidents, monitors team requests
- **Technician**: Receives assignments, updates ticket status, comments on maintenance progress
- **Admin**: Manages users/roles, approves bookings, assigns technicians, monitors system activity

### Recommended Work Allocation (Individual Assessment Visibility)

- **Member 1**: Facilities catalogue + resource management endpoints
- **Member 2**: Booking workflow + conflict checking
- **Member 3**: Incident tickets + attachments + technician updates
- **Member 4**: Notifications + role management + OAuth integration improvements

### Additional Feature Ownership

- **Member 2**: QR code check-in for approved bookings (verification screen + validation endpoint)
- **Member 4**: Admin dashboard usage analytics (top resources, peak booking hours)
- **Member 3**: Service-level timers for tickets (time-to-first-response, time-to-resolution)
- **Member 4**: Notification preferences (enable/disable categories)

### Additional Feature Ownership (Round 2 - One New Feature Per Module)

- **Member 1 (Module A)**: Resource maintenance blackout calendar (temporarily block unavailable slots)
- **Member 2 (Module B)**: Booking waitlist with auto-promotion when approved bookings are cancelled
- **Member 3 (Module C)**: Technician workload assistant (assignment suggestions based on active load)
- **Member 4 (Module D+E)**: Account security activity and suspicious login alerts

---

## 🎬 Full Project Scenario (End-to-End)

This section describes how the complete Smart Campus Operations Hub should work when all modules are integrated.

### 1) User Access & Security Flow

1. A new user can register as **Student**, **Staff**, or **Technician**.
2. Users can also onboard through **Google signup/signin**; first login creates user profile, later logins authenticate existing account.
3. Backend validates identity and issues JWT access and refresh tokens.
4. Role-based authorization controls access to pages and APIs (`STUDENT`, `STAFF`, `TECHNICIAN`, `ADMIN`).
5. Protected routes and backend filters ensure only authorized actions are allowed.
6. After login, users are redirected to their role-specific dashboard.

### 2) Facilities Catalogue Flow (Module A)

1. Admin creates and maintains resources (lecture halls, labs, meeting rooms, equipment).
2. Each resource has status, location, capacity, and availability windows.
3. Users browse facilities with filtering and search.
4. Admin can update or soft-delete resources when unavailable.

### 3) Booking Management Flow (Module B)

1. A user selects a resource and requests a booking with date/time and purpose.
2. Booking logic checks for overlapping time conflicts.
3. Valid requests are created as `PENDING`.
4. Admin reviews and approves/rejects requests.
5. User can view booking history and cancel bookings when allowed.

### 4) Maintenance & Ticketing Flow (Module C)

1. A user reports an issue by creating a ticket with category, priority, and details.
2. Optional attachments are uploaded as evidence.
3. Admin assigns tickets to technicians.
4. Technician updates lifecycle state (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).
5. Users, admins, and technicians collaborate through comments with ownership rules.

### 5) Notifications Flow (Module D)

1. System events trigger notifications (booking approved/rejected, ticket assigned/resolved, etc.).
2. Each user receives notification records in their feed.
3. Users can list notifications, mark one/all as read, and delete old items.
4. Frontend notification UI surfaces unread counts and recent updates.

### 6) Cross-Module Integration Flow

1. Facilities data drives booking availability.
2. Booking and ticket actions trigger notifications.
3. Auth and roles apply uniformly across all modules.
4. Shared API response/error contracts maintain consistency between frontend and backend.

### 7) Data & Persistence Flow

1. PostgreSQL stores users, resources, availability windows, bookings, tickets, ticket comments, ticket attachments, and notifications.
2. Foreign keys enforce entity relationships across modules.
3. JPA repositories/services implement data access and business rules.
4. Flyway migrations maintain schema history across environments.

### 8) Quality & Delivery Flow

1. Unit tests validate service logic.
2. `@DataJpaTest` validates repository behavior.
3. `MockMvc` verifies controller endpoint behavior and security.
4. Postman collections validate full API workflows.
5. Final submission includes working code, docs, screenshots, test evidence, and coverage target.

### 9) Final Acceptance Scenario

Project is considered complete when:

- Users can authenticate and access role-based features.
- Users can register as Student, Staff, and Technician.
- Google signup/signin works for both first-time and returning users.
- Admin can manage facilities and approve/reject bookings.
- Users can raise tickets and technicians can resolve them.
- Notification workflows are integrated and visible in UI.
- All required tests, documentation, and submission checklist items are completed.

### 10) Dashboard Experience by User Type

1. **Student Dashboard**

- My bookings (upcoming, pending, rejected)
- My tickets (open/in-progress/resolved)
- Quick actions: New Booking, Report Issue
- Notifications panel

2. **Staff Dashboard**

- Department-related bookings and approvals requested
- Service/maintenance requests raised by staff member
- Operational notifications and reminders

3. **Technician Dashboard**

- Assigned tickets queue (priority + SLA)
- Status update actions and comment timeline
- Recently resolved work summary

4. **Admin Dashboard**

- Booking approval queue
- Ticket assignment board
- User/role management panel
- System activity metrics and alerts

---

## 🗄️ Database: PostgreSQL + JPA

> Uses auto-incrementing Long IDs, foreign key relationships, and Flyway for schema management.
> All entities mapped using Spring Data JPA `@Entity` and `@Table` annotations.

### Key Tables

| Table                  | Purpose                      | Primary Key    |
| ---------------------- | ---------------------------- | -------------- |
| `users`                | User accounts + roles        | `id BIGSERIAL` |
| `resources`            | Facilities/assets catalogue  | `id BIGSERIAL` |
| `availability_windows` | Opening hours per resource   | `id BIGSERIAL` |
| `bookings`             | Resource booking requests    | `id BIGSERIAL` |
| `tickets`              | Incident/maintenance tickets | `id BIGSERIAL` |
| `ticket_attachments`   | Evidence files               | `id BIGSERIAL` |
| `ticket_comments`      | Ticket discussion threads    | `id BIGSERIAL` |
| `notifications`        | User notifications           | `id BIGSERIAL` |

---

## 🗂️ Project Initialization (All Members)

### Repository & Environment Setup

- [ ] Create GitHub repo: `it3030-paf-2026-smart-campus-groupXX`
- [ ] Add all team members as collaborators
- [ ] Define branch naming: `feature/<member>/<feature-name>`
- [ ] Bootstrap Spring Boot via [start.spring.io](https://start.spring.io):
  - Spring Web, **Spring Data JPA**, Spring Security, Spring OAuth2 Client, PostgreSQL Driver, Validation, Lombok
- [ ] Bootstrap React: `npm create vite@latest frontend -- --template react`
- [ ] Install frontend: `axios`, `react-router-dom`, `tailwindcss`
- [ ] Configure `.gitignore` (exclude `node_modules/`, `target/`, `.env`)
- [ ] Create `.env.example` files for backend and frontend

### PostgreSQL Setup

- [ ] Option A: Install PostgreSQL 14+ locally
- [ ] Option B: Use cloud PostgreSQL (Railway, Heroku, AWS RDS, Railway)
- [ ] Create database: `smartcampus_db`
- [ ] Configure `backend/src/main/resources/application.yml`:
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/smartcampus_db
      username: postgres
      password: ${DB_PASSWORD}
    jpa:
      hibernate:
        ddl-auto: update
      show-sql: true
  ```
- [ ] Add test profile with H2 database
- [ ] Add Flyway for migrations: `V1__Create_initial_schema.sql`
- [ ] Verify Spring Boot starts successfully with PostgreSQL

---

## 👤 Developer 1 – Facilities & Assets Catalogue (Module A)

### Scenario

**"I'm building the resource catalogue. Campus admin wants searchable halls, labs, rooms, and equipment with availability windows. I'll create CRUD APIs first, then connect frontend pages."**

### Backend Tasks

- [ ] **D1-B01** Create `Resource` JPA entity with `@Entity @Table("resources")`
- [ ] **D1-B02** Create `ResourceType` enum: `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT`
- [ ] **D1-B03** Create `ResourceStatus` enum: `ACTIVE`, `OUT_OF_SERVICE`, `UNDER_MAINTENANCE`
- [ ] **D1-B04** Create `AvailabilityWindow` JPA entity with `@ManyToOne` to Resource
- [ ] **D1-B05** Create `ResourceRepository extends JpaRepository<Resource, Long>`
  - [ ] Custom finder methods for type, status, capacity
  - [ ] JPQL @Query for location search
- [ ] **D1-B06** Create `ResourceService` with validation logic
- [ ] **D1-B07** Create `ResourceController` with 6 endpoints
  - GET /api/v1/resources (with filters)
  - GET /api/v1/resources/{id}
  - POST /api/v1/resources (ADMIN)
  - PUT /api/v1/resources/{id} (ADMIN)
  - DELETE /api/v1/resources/{id} (ADMIN soft-delete)
  - GET /api/v1/resources/{id}/availability
- [ ] **D1-B08** Create DTOs: ResourceDTO, ResourceRequestDTO, ResourceResponseDTO
- [ ] **D1-B09** Add `@Valid` validation annotations
- [ ] **D1-B10** Write min 5 unit tests using `@DataJpaTest`
- [ ] **D1-B11** Write integration tests using `MockMvc`
- [ ] **D1-B12** Add Swagger/OpenAPI annotations
- [ ] **D1-B13** Seed initial test data via `CommandLineRunner`
- [ ] **D1-B14** Add resource maintenance blackout model and API to mark blocked periods
- [ ] **D1-B15** Enforce blackout validation in availability query and booking eligibility checks

### Frontend Tasks

- [ ] **D1-F01** Create `ResourcesPage` with list/grid view + search
- [ ] **D1-F02** Create `ResourceCard` component
- [ ] **D1-F03** Create `ResourceDetailPage` with availability calendar
- [ ] **D1-F04** Create `ResourceForm` (Add/Edit) for admins
- [ ] **D1-F05** Create `ResourceFilter` component
- [ ] **D1-F06** Implement `resourceService.js` (axios calls)
- [ ] **D1-F07** Add admin-only buttons/links
- [ ] **D1-F08** Handle loading/error states
- [ ] **D1-F09** Create maintenance blackout calendar UI for admins on resource detail page
- [ ] **D1-F10** Show blocked/unavailable slot badges in facility availability view

---

## 👤 Developer 2 – Booking Management (Module B)

### Scenario

**"Users book facilities with date/time slots. I must prevent conflicts (overlapping bookings) and implement approval workflow. Admin approves/rejects requests."**

### Backend Tasks

- [ ] **D2-B01** Create `Booking` JPA entity with compound index on `(resource_id, booking_date, status)`
- [ ] **D2-B02** Create `BookingStatus` enum: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- [ ] **D2-B03** Create `BookingRepository extends JpaRepository<Booking, Long>`
  - [ ] Custom JPQL @Query for conflict detection
  - [ ] Finders by userId, status, resource
- [ ] **D2-B04** Create `BookingService` with conflict detection logic
- [ ] **D2-B05** Create `BookingController` with 7 endpoints
  - POST /api/v1/bookings
  - GET /api/v1/bookings (filtered)
  - GET /api/v1/bookings/{id}
  - PUT /api/v1/bookings/{id}/approve (ADMIN)
  - PUT /api/v1/bookings/{id}/reject (ADMIN)
  - PUT /api/v1/bookings/{id}/cancel
  - GET /api/v1/resources/{id}/bookings (for calendar)
- [ ] **D2-B06** Create DTOs: BookingDTO, BookingRequestDTO
- [ ] **D2-B07** Add date/time validation (no past dates)
- [ ] **D2-B08** Write min 5 unit tests for conflict detection
- [ ] **D2-B09** Write integration tests for approval workflow
- [ ] **D2-B10** Add Swagger annotations
- [ ] **D2-B11** Add QR check-in token generation for approved bookings
- [ ] **D2-B12** Add QR check-in verification endpoint (`POST /api/v1/bookings/{id}/check-in`)
- [ ] **D2-B13** Add booking check-in audit fields (checked-in-by, checked-in-at, verification-status)
- [ ] **D2-B14** Add waitlist model and repository for fully booked resource slots
- [ ] **D2-B15** Implement waitlist auto-promotion logic when approved booking is cancelled/rejected

### Frontend Tasks

- [ ] **D2-F01** Create `BookingRequestPage` with form (date, time, purpose)
- [ ] **D2-F02** Create `MyBookingsPage` with status tabs
- [ ] **D2-F03** Create `AdminBookingsPage` (approval queue)
- [ ] **D2-F04** Create `BookingCard` component
- [ ] **D2-F05** Implement date/time picker with conflict preview
- [ ] **D2-F06** Implement `bookingService.js` (axios)
- [ ] **D2-F07** Show conflict errors with alternative times
- [ ] **D2-F08** Add approve/reject buttons for admins
- [ ] **D2-F09** Build QR code display on approved booking details
- [ ] **D2-F10** Build QR verification screen for staff/admin check-in validation
- [ ] **D2-F11** Add waitlist join action on booking conflict screen
- [ ] **D2-F12** Show waitlist status and promotion updates in My Bookings

---

## 👤 Developer 3 – Maintenance & Incident Ticketing (Module C)

### Scenario

**"Students report facility issues with photos. Admins assign technicians. Technicians update status and comment. I manage tickets, comments, attachments with embedded relationships."**

### Backend Tasks

- [ ] **D3-B01** Create `Ticket` JPA entity (main table)
- [ ] **D3-B02** Create `TicketStatus` enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`
- [ ] **D3-B03** Create `TicketPriority` enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- [ ] **D3-B04** Create `TicketCategory` enum: `ELECTRICAL`, `PLUMBING`, `IT_EQUIPMENT`, `HVAC`, `STRUCTURAL`, `OTHER`
- [ ] **D3-B05** Create `TicketAttachment` JPA entity (separate table with FK to Ticket)
- [ ] **D3-B06** Create `TicketComment` JPA entity (separate table with FK to Ticket, User)
- [ ] **D3-B07** Create `TicketRepository` with finders for reporter, assigned tech, status
- [ ] **D3-B08** Create `TicketService` with:
  - [ ] Status workflow validation (OPEN → IN_PROGRESS → RESOLVED)
  - [ ] Attachment upload (max 3 files)
  - [ ] Comment CRUD operations
  - [ ] Comment ownership rules (user can edit/delete own)
- [ ] **D3-B09** Create `TicketController` with 6 endpoints
  - POST /api/v1/tickets (multipart for attachments)
  - GET /api/v1/tickets (with filters)
  - GET /api/v1/tickets/{id}
  - PUT /api/v1/tickets/{id}/status (ADMIN/TECH)
  - PUT /api/v1/tickets/{id}/assign (ADMIN)
  - DELETE /api/v1/tickets/{id} (soft-delete)
- [ ] **D3-B10** Create `TicketCommentController` with 3 endpoints
  - POST /api/v1/tickets/{id}/comments
  - PUT /api/v1/tickets/{id}/comments/{commentId}
  - DELETE /api/v1/tickets/{id}/comments/{commentId}
- [ ] **D3-B11** Implement MultipartFile upload with file validation
- [ ] **D3-B12** Write min 5 unit tests
- [ ] **D3-B13** Write integration tests for comment/attachment ops
- [ ] **D3-B14** Add Swagger annotations
- [ ] **D3-B15** Add SLA timer fields to ticket model (`first_response_at`, `resolved_at`, `sla_breached`)
- [ ] **D3-B16** Implement service-level timer calculations (time-to-first-response, time-to-resolution)
- [ ] **D3-B17** Add ticket SLA metrics endpoint for dashboard consumption
- [ ] **D3-B18** Add technician workload metrics endpoint (active tickets, priority mix, overdue count)
- [ ] **D3-B19** Implement assignment suggestion service based on workload balancing rules

### Frontend Tasks

- [ ] **D3-F01** Create `CreateTicketPage` with image upload (max 3)
- [ ] **D3-F02** Create `MyTicketsPage` (user's reported tickets)
- [ ] **D3-F03** Create `AdminTicketsPage` (all tickets, with assign UI)
- [ ] **D3-F04** Create `TicketDetailPage` with comments, attachments, timeline
- [ ] **D3-F05** Create `CommentSection` with edit/delete
- [ ] **D3-F06** Create `ImageUploadPreview` (drag-drop)
- [ ] **D3-F07** Create status/priority badge components
- [ ] **D3-F08** Implement `ticketService.js` (axios)
- [ ] **D3-F09** Show SLA indicators and elapsed timers on technician and admin ticket views
- [ ] **D3-F10** Add assignment suggestion panel to admin ticket assignment view
- [ ] **D3-F11** Show technician workload indicators (load chips/heat status) in ticket board

---

## 👤 Developer 4 – Notifications & Authentication (Modules D & E)

### Scenario

**"Users login with Google OAuth. I issue JWT tokens. All modules trigger notifications. I build notification delivery, dashboards, and auth endpoints."**

### Role-Based Authentication System (RBAC)

- [x] Define final role model: `STUDENT`, `STAFF`, `TECHNICIAN`, `ADMIN`
- [x] Implement registration role selection for Student/Staff/Technician
- [x] Authenticate users via OAuth2/email-password and issue JWT tokens
- [x] Implement Google signup vs signin branching (create-on-first-login, link-existing-account)
- [x] Enforce backend access with role-based method security (`@PreAuthorize`)
- [x] Protect admin operations at API level (example: admin-only booking endpoint)
- [x] Complete frontend role guards (`<ProtectedRoute>` + per-role page restrictions)
- [x] Complete admin role management endpoints (`GET /api/v1/users`, `PUT /api/v1/users/{id}/role`)
- [x] Add post-login role-based dashboard redirects and default landing rules

### Backend Tasks

- [x] **D4-B01** Create `Notification` JPA entity
- [x] **D4-B02** Create `NotificationType` enum
- [x] **D4-B03** Create `NotificationRepository` with finder methods
- [x] **D4-B04** Create `NotificationService`
- [x] **D4-B05** Create `NotificationController` with 4 endpoints
  - GET /api/v1/notifications (paginated)
  - PUT /api/v1/notifications/{id}/read
  - PUT /api/v1/notifications/read-all
  - DELETE /api/v1/notifications/{id}
- [ ] **D4-B06** Integrate notification triggers in BookingService, TicketService
- [x] **D4-B07** Create `User` JPA entity with `@Indexed` unique email, providerId
- [x] **D4-B08** Create `Role` enum: `STUDENT`, `STAFF`, `ADMIN`, `TECHNICIAN`
- [x] **D4-B09** Create `UserRepository` with finders by email, providerId, role
- [x] **D4-B10** Configure Spring Security:
  - [x] OAuth 2.0 (Google) login
  - [x] JWT issuance post-OAuth2
  - [x] JwtAuthenticationFilter
  - [x] SecurityConfig with @PreAuthorize
- [x] **D4-B11** Create `AuthController` (2 endpoints)
  - GET /api/v1/auth/me
  - POST /api/v1/auth/logout
- [x] **D4-B12** Create `UserController` (2 admin endpoints)
  - GET /api/v1/users
  - PUT /api/v1/users/{id}/role
- [x] **D4-B13** Implement global exception handler
- [x] **D4-B14** Implement CORS config
- [ ] **D4-B15** Write min 5 unit tests
- [ ] **D4-B16** Write auth integration tests
- [x] **D4-B17** Expand `Role` model to include `STUDENT` and `STAFF` (with migration + seed updates)
- [x] **D4-B18** Add registration API support for selected role (`STUDENT`/`STAFF`/`TECHNICIAN`)
- [ ] **D4-B19** Add Google onboarding policy service:
  - First Google login creates account with default role policy
  - Existing email account links/signs in safely
  - Audit fields for provider and role assignment source
- [x] **D4-B20** Add role-based dashboard bootstrap endpoint (`/api/v1/auth/bootstrap`) returning user + dashboard config
- [ ] **D4-B21** Add auth test coverage for role registration and Google signup/signin flows
- [x] **D4-B22** Add notification preference model per user (booking, ticket, security, reminders)
- [x] **D4-B23** Add notification preference endpoints:
  - GET `/api/v1/notifications/preferences`
  - PUT `/api/v1/notifications/preferences`
- [x] **D4-B24** Add admin analytics endpoint(s):
  - GET `/api/v1/admin/analytics/top-resources`
  - GET `/api/v1/admin/analytics/peak-booking-hours`
- [x] **D4-B25** Add security activity log model for authentication events (login, refresh, logout, failed login)
- [x] **D4-B26** Add suspicious login detection rules (new device/location heuristic) + alert notification trigger

### Frontend Tasks

- [x] **D4-F01** Implement Google OAuth login page
- [x] **D4-F02** Implement JWT storage + axios interceptor
- [x] **D4-F03** Create `AuthContext` / Redux auth slice
- [x] **D4-F04** Implement `<ProtectedRoute>` HOC
- [x] **D4-F05** Create `NotificationBell` in navbar
- [x] **D4-F06** Create `NotificationPanel` dropdown
- [x] **D4-F07** Create `UserManagementPage` (admin only)
- [x] **D4-F08** Implement `notificationService.js`, `authService.js`
- [x] **D4-F09** Auto-logout on token expiry
- [x] **D4-F10** Add signup form role selector (`Student`, `Staff`, `Technician`)
- [x] **D4-F11** Implement Google signup/signin UX messaging (new account vs returning account)
- [x] **D4-F12** Build role-based landing redirect after login
- [x] **D4-F13** Create `StudentDashboardPage`
- [x] **D4-F14** Create `StaffDashboardPage`
- [x] **D4-F15** Create `TechnicianDashboardPage`
- [x] **D4-F16** Enhance `AdminDashboardPage` with booking, ticket, and user widgets
- [x] **D4-F17** Add dashboard-level notification widgets for all roles
- [x] **D4-F18** Build notification preferences settings UI (toggle categories per user)
- [x] **D4-F19** Build admin analytics dashboard widgets (top resources + peak booking hours charts)
- [x] **D4-F20** Create account security activity screen (recent sign-ins and device/location summary)
- [x] **D4-F21** Show suspicious login alert banner with user acknowledgement action

### Member 4 Completion Summary (21 Apr 2026) ✅

**Backend Implementation (D4-B Series)**:
- [x] D4-B01 through D4-B05: Notification JPA entity, NotificationType enum, NotificationRepository, NotificationService, NotificationController (4 endpoints: paginated GET, mark read, mark all read, delete)
- [x] D4-B07 through D4-B14: User entity, UserRole enum (STUDENT/STAFF/TECHNICIAN/ADMIN), UserRepository, Spring Security config, JWT, AuthController, global exception handler, CORS
- [x] D4-B12: Admin user management endpoints (GET /api/v1/users list all users, PUT /api/v1/users/{id}/role update role)
- [x] D4-B17 through D4-B20: Role expansion (STUDENT/STAFF added to enum), registration API with role selection, bootstrap endpoint with role-based dashboard config
- [x] D4-B22 through D4-B23: Notification preferences model/repository/service/endpoints (GET/PUT for user preference toggles)
- [x] D4-B24: Admin analytics endpoints (GET /api/v1/admin/analytics/top-resources, GET /api/v1/admin/analytics/peak-booking-hours)
- [x] D4-B25 through D4-B26: SecurityActivityLog entity with suspicious-login detection heuristics, SecurityActivityService logging, SecurityActivityController with 3 endpoints (get activity, get suspicious, acknowledge)
- [ ] D4-B06: Notification triggers in BookingService/TicketService (pending other modules completion)
- [ ] D4-B15/D4-B16: Expanded unit/integration test coverage (core NotificationServiceTest implemented; auth integration tests pending)
- [ ] D4-B19/D4-B21: Google OAuth edge-case handling and comprehensive auth test coverage (infrastructure exists)

**Frontend Implementation (D4-F Series)**:
- [x] D4-F01 through D4-F04: Google OAuth login, JWT storage, axios interceptor, AuthContext, ProtectedRoute HOC
- [x] D4-F05 through D4-F08: NotificationBell component, NotificationPanel dropdown, UserManagementPage, API services (notification, auth, security)
- [x] D4-F09 through D4-F12: Auto-logout on token expiry, signup role selector, Google OAuth UX messaging, role-based landing redirects
- [x] D4-F13 through D4-F17: StudentDashboardPage, StaffDashboardPage, TechnicianDashboardPage, AdminDashboardPage, dashboard-level notification widgets
- [x] D4-F18 through D4-F21: Notification preferences UI, admin analytics widgets, account security activity page, suspicious login alert banner with acknowledgement action

**Code Quality & Bug Fixes**:
- [x] Fixed JPQL timestamp type mismatches in NotificationRepository and SecurityActivityLogRepository (OffsetDateTime parameterization)
- [x] Fixed TypeScript import paths in 6 frontend page components (../../ → ../../../)
- [x] Fixed TypeScript type inference for React state updater callbacks
- [x] Fixed Mockito strict stubbing violations in NotificationServiceTest (lenient() wrappers)
- [x] Fixed CSS inline styles linting warning (created .truncate-text utility class)
- [x] All backend tests passing (7/7, 0 failures)
- [x] All frontend production build passing (151 modules, optimized bundles)

**Completed Deliverables**:
- ✅ All Member 4 backend endpoints fully implemented and type-checked
- ✅ All Member 4 frontend pages created with correct import paths
- ✅ Role-based authentication system (STUDENT/STAFF/TECHNICIAN/ADMIN)
- ✅ Admin user management functionality
- ✅ Notification system with preferences and delivery
- ✅ Security activity logging with suspicious login detection
- ✅ Role-specific dashboards with proper redirects
- ✅ End-to-end suspicious login alert acknowledgement flow
- ✅ Backend compilation and test validation
- ✅ Frontend production build validation

**Known Pending Items** (External Dependencies):
- D4-B06: Notification trigger integration awaits booking/ticket service completion by Dev 2/Dev 3
- D4-B15/B16: Extended test coverage and auth integration tests (core tests implemented)
- D4-B19/B21: Google OAuth edge-case refinements and comprehensive flow testing

---

## 🔧 Shared Tasks (All Members)

### API Standards

- [ ] Agree on response wrapper: `{ "success": bool, "data": {...}, "message": "..." }`
- [ ] Error format: `{ "error": "...", "details": {...} }`
- [ ] All IDs are Long (PostgreSQL auto-increment)
- [ ] Setup Swagger UI at `/swagger-ui.html`

### Testing

- [ ] Each member: min 5 unit tests per service
- [ ] Use `@DataJpaTest` for repository tests
- [ ] Use `MockMvc` for controller tests
- [ ] Create Postman collection per module
- [ ] Target 70%+ coverage per module

### Documentation

- [ ] Document all endpoints in shared API doc
- [ ] Final report: SRS, diagrams, endpoint list, test evidence
- [ ] Screenshots of workflows + database diagram

---

## 📅 Timeline

| Week                  | Focus                        | Milestones                             |
| --------------------- | ---------------------------- | -------------------------------------- |
| Week 1 (24-30 Mar)    | Setup, DB config, entities   | All schemas created, Spring Boot boots |
| Week 2 (31 Mar-6 Apr) | Modules A & B APIs           | Resources + Bookings working           |
| Week 3 (7-13 Apr)     | Modules C & D APIs           | Tickets + Auth working                 |
| Week 4 (14-20 Apr)    | Notifications, role-based UI | All notifications working              |
| Week 5 (21-25 Apr)    | Bug fixes, docs, Postman     | Tests passing, docs complete           |
| **Submission**        | **27 Apr**                   | **Final submission by 11:45 PM**       |

---

## 📁 Submission Checklist

- [ ] GitHub repo public (`it3030-paf-2026-smart-campus-groupXX`)
- [ ] README with PostgreSQL setup instructions
- [ ] All 4 modules implemented
- [ ] GitHub Actions CI passing
- [ ] Postman collection exported
- [ ] Report PDF with diagrams + contribution
- [ ] Screenshots of key workflows
- [ ] 70%+ test coverage
- [ ] All endpoints tested + working

---

_Last updated: April 2026 — Stack: Spring Boot 3.3 + React 18 + **PostgreSQL 14** + JPA_

---

## 🎯 COMPLETION SUMMARY

### ✅ What Has Been Delivered

**1. Complete Task List Document** ✓

- 300+ lines of detailed, actionable tasks
- 4 developer modules with clear scenarios
- ~88 total tasks (backend + frontend + shared)
- Professional formatting matching industry standards

**2. Database Design** ✓

- 8 PostgreSQL tables with relationships
- JPA entity specifications
- Compound indexes for performance
- Flyway migration strategy

**3. Developer Guidance** ✓

- Personal scenarios for each developer
- Clear backend/frontend responsibilities
- Integration points between modules
- Quality standards (70%+ test coverage)

**4. Timeline & Milestones** ✓

- 5-week development sprint
- Weekly milestones
- Submission checklist

### 📊 Tasks by Developer

**Dev 1 - Facilities Catalogue:**

- 13 backend tasks (entity, repository, 6 endpoints, tests)
- 8 frontend tasks (pages, components, services)
- Database: `resources`, `availability_windows`

**Dev 2 - Booking Management:**

- 10 backend tasks (entity, conflict detection, 7 endpoints)
- 8 frontend tasks (booking flow, approval UI)
- Database: `bookings` with compound index

**Dev 3 - Incident Ticketing:**

- 14 backend tasks (entity, multipart upload, 9 endpoints)
- 8 frontend tasks (report, detail, comments)
- Database: `tickets`, `ticket_comments`, `ticket_attachments`

**Dev 4 - Notifications & Auth:**

- 16 backend tasks (OAuth 2.0, JWT, notifications)
- 9 frontend tasks (login, notification bell, dashboards)
- Database: `users`, `notifications`

### 🚀 Ready for Execution

This document is **production-ready** and includes everything your team needs to:
✅ Understand their role and responsibilities  
✅ Know what to build and when  
✅ Understand database design  
✅ Follow quality standards  
✅ Track progress against timeline  
✅ Submit on deadline (27 April 2026)

### 📁 Files in Repository

**Main Document:**

- `docs/04_full_task_list.md` ← YOU ARE HERE

**Supporting Files:**

- `QUICK_START_GUIDE.md` - Quick reference for team
- `DEVELOPER_ASSIGNMENTS.md` - Assignment matrix + sprint schedule
- `README_DOCUMENTATION.md` - Navigation index
- `docs/04_full_task_list_postgresql.md` - Extended PostgreSQL version
- `docs/02_api_documentation.md` - API endpoint specs
- `docs/03_database_schema.sql` - SQL schema
- `docs/01_use_cases.md` - User stories

### 🎓 How Your Team Uses This

1. **Share this file** with all 4 developers
2. **Each dev reads their module section** (has personal scenario)
3. **Week 1:** Setup + database initialization
4. **Weeks 2-5:** Execute tasks according to timeline
5. **Final week:** Testing + documentation
6. **27 April:** Submit using the checklist

---

**Status: ✅ COMPLETE & READY FOR TEAM EXECUTION**

Document created: 6 April 2026  
Stack: Spring Boot 3.3 + React 18 + PostgreSQL 14 + JPA  
Team size: 4 developers  
Execution timeline: 5 weeks
