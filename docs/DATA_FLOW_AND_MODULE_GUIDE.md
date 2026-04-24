# Smart Campus Data Flow and Module Guide

This document explains how data moves between the React frontend, Spring Boot backend, and database. It also maps each developer module to its frontend files, backend files, SQL tables, innovation areas, and image upload responsibilities.

## 1. High-Level Architecture

The project is a full-stack Smart Campus Operations platform.

Frontend:

- React 18
- Vite
- Axios
- TanStack Query/hooks
- Tailwind CSS

Backend:

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT authentication

Database:

- The README mentions MySQL, but the current backend configuration uses PostgreSQL by default.
- Main backend database config is in `backend/src/main/resources/application.yml`.
- Current SQL schema file is `backend/db/full_schemas.sql`.

## 2. General Data Flow

The frontend does not connect directly to the database. All data must pass through backend API endpoints.

```text
React page/component
  -> React hook
  -> frontend service API file
  -> Axios client
  -> Spring Boot controller
  -> service layer
  -> repository layer
  -> JPA entity/model
  -> database table
```

Response flow:

```text
database
  -> entity/model
  -> service maps entity to DTO
  -> controller returns JSON
  -> Axios receives response
  -> hook/component updates UI
```

The backend returns DTO objects such as `ResourceDto`, `BookingDto`, `TicketDto`, `NotificationDto`, and `UserDto`. This keeps the frontend separated from internal database entities.

## 3. Frontend API Flow

All frontend API calls use the shared Axios client:

```text
frontend/src/lib/axios.ts
```

The Axios client:

- sets the API base URL
- sends cookies with requests
- attaches the JWT access token as a Bearer token
- refreshes the access token when a `401 Unauthorized` response is received

Main frontend service files:

| Module | API Service File |
| --- | --- |
| Auth and users | `frontend/src/services/api/authApi.ts` |
| Facilities/resources | `frontend/src/services/api/facilityApi.ts` |
| Bookings | `frontend/src/services/api/bookingApi.ts` |
| Tickets | `frontend/src/services/api/ticketApi.ts` |
| Notifications | `frontend/src/services/api/notificationApi.ts` |
| Security activity | `frontend/src/services/api/securityApi.ts` |

## 4. Backend API Flow

The backend follows a normal Spring Boot layered architecture.

```text
Controller
  receives HTTP request

Service
  applies business rules and validation

Repository
  performs database operations

Model/entity
  maps Java objects to database tables

DTO
  sends safe response data back to frontend
```

Example booking flow:

```text
frontend/src/services/api/bookingApi.ts
  -> POST /api/v1/bookings
  -> BookingController.createBooking()
  -> BookingService.createBooking()
  -> BookingRepository / ResourceRepository / WaitlistEntryRepository
  -> bookings and waitlist_entries tables
  -> BookingDto response
```

## 5. Module D1: Facilities and Resources

Developer responsibility:

- Facilities catalogue
- Resource filtering/search
- Availability windows
- Maintenance blackout handling
- Resource availability calendar

### Frontend Files

```text
frontend/src/services/api/facilityApi.ts
frontend/src/hooks/useFacilities.ts
frontend/src/components/facilities/
frontend/src/app/facilities/
frontend/src/app/admin/facilities/
```

### Backend Files

```text
backend/src/main/java/edu/sliit/smartcampus/controller/FacilityController.java
backend/src/main/java/edu/sliit/smartcampus/service/FacilityService.java
backend/src/main/java/edu/sliit/smartcampus/repository/ResourceRepository.java
backend/src/main/java/edu/sliit/smartcampus/repository/AvailabilityWindowRepository.java
backend/src/main/java/edu/sliit/smartcampus/repository/MaintenanceBlackoutRepository.java
backend/src/main/java/edu/sliit/smartcampus/model/Resource.java
backend/src/main/java/edu/sliit/smartcampus/model/AvailabilityWindow.java
backend/src/main/java/edu/sliit/smartcampus/model/MaintenanceBlackout.java
```

### API Endpoints

```text
GET    /api/v1/resources
GET    /api/v1/resources/{id}
POST   /api/v1/resources
PUT    /api/v1/resources/{id}
DELETE /api/v1/resources/{id}
GET    /api/v1/resources/{id}/availability
GET    /api/v1/resources/{id}/maintenance-blackouts
POST   /api/v1/resources/{id}/maintenance-blackouts
DELETE /api/v1/resources/{id}/maintenance-blackouts/{blackoutId}
```

### Related SQL Tables

Implemented/current:

- `resources`
- `availability_windows`
- `maintenance_blackouts`
- `resource_amenities`
- `resource_specifications`

Documented/planned:

- `resource_images`

### Innovation Area

The innovation in this module is the dynamic availability calculation. `FacilityService` combines:

- configured operating hours
- pending/approved bookings
- maintenance blackout periods
- resource status

Then it returns availability slots such as `AVAILABLE`, `OCCUPIED`, `BLOCKED`, or `UNAVAILABLE`.

### Image Upload Status

Facility image upload is not fully implemented as a file upload workflow.

Current implementation:

- `Resource` has a `thumbnailUrl` field.
- The frontend/backend can store an image URL as text.

Not currently implemented:

- local facility image upload
- backend resource image storage service
- Java entity for `resource_images`

## 6. Module D2: Booking Management

Developer responsibility:

- Booking requests
- Admin approval/rejection
- Conflict detection
- Alternative slot suggestion
- Waitlist management
- QR check-in

### Frontend Files

```text
frontend/src/services/api/bookingApi.ts
frontend/src/hooks/useBookings.ts
frontend/src/components/bookings/
frontend/src/app/bookings/
frontend/src/app/admin/bookings/
```

### Backend Files

```text
backend/src/main/java/edu/sliit/smartcampus/controller/BookingController.java
backend/src/main/java/edu/sliit/smartcampus/service/BookingService.java
backend/src/main/java/edu/sliit/smartcampus/repository/BookingRepository.java
backend/src/main/java/edu/sliit/smartcampus/repository/WaitlistEntryRepository.java
backend/src/main/java/edu/sliit/smartcampus/model/Booking.java
backend/src/main/java/edu/sliit/smartcampus/model/WaitlistEntry.java
```

### API Endpoints

```text
POST /api/v1/bookings
POST /api/v1/bookings/conflicts/preview
GET  /api/v1/bookings
GET  /api/v1/bookings/{id}
PUT  /api/v1/bookings/{id}/approve
PUT  /api/v1/bookings/{id}/reject
PUT  /api/v1/bookings/{id}/cancel
POST /api/v1/bookings/{id}/check-in
GET  /api/v1/bookings/admin/all
GET  /api/v1/bookings/resource/{resourceId}
```

Note: `bookingApi.ts` currently calls `/resources/{resourceId}/bookings` for resource bookings, while the backend exposes `/api/v1/bookings/resource/{resourceId}`. This should be checked during integration.

### Related SQL Tables

Implemented/current:

- `bookings`
- `waitlist_entries`

Documented/planned:

- `booking_status_history`

### Innovation Area

The innovation in this module is booking intelligence:

- `previewConflict()` checks whether a requested slot conflicts with approved bookings.
- `findAlternativeSlots()` suggests available replacement slots.
- conflicting booking requests can be placed into a waitlist.
- when an approved booking is cancelled, `autoPromoteWaitlist()` promotes the next waiting booking.
- approval generates a unique `qrToken`.
- check-in validates the scanned QR token before completing the booking.

### Image Upload Status

Booking module has no image upload flow.

## 7. Module D3: Maintenance and Incident Tickets

Developer responsibility:

- Incident ticket creation
- Photo evidence upload
- Ticket assignment
- Ticket status workflow
- Comments and internal notes
- SLA monitoring
- Technician workload analytics

### Frontend Files

```text
frontend/src/services/api/ticketApi.ts
frontend/src/hooks/useTickets.ts
frontend/src/components/tickets/
frontend/src/app/tickets/
frontend/src/app/admin/tickets/
frontend/src/app/dashboard/technician/
```

Important upload UI files:

```text
frontend/src/components/tickets/TicketForm.tsx
frontend/src/components/tickets/ImageUploadPreview.tsx
```

### Backend Files

```text
backend/src/main/java/edu/sliit/smartcampus/controller/TicketController.java
backend/src/main/java/edu/sliit/smartcampus/controller/AdminTicketMetricsController.java
backend/src/main/java/edu/sliit/smartcampus/service/TicketService.java
backend/src/main/java/edu/sliit/smartcampus/service/TicketFileStorageService.java
backend/src/main/java/edu/sliit/smartcampus/repository/TicketRepository.java
backend/src/main/java/edu/sliit/smartcampus/repository/TicketCommentRepository.java
backend/src/main/java/edu/sliit/smartcampus/repository/TicketAttachmentRepository.java
backend/src/main/java/edu/sliit/smartcampus/model/Ticket.java
backend/src/main/java/edu/sliit/smartcampus/model/TicketComment.java
backend/src/main/java/edu/sliit/smartcampus/model/TicketAttachment.java
```

### API Endpoints

```text
POST   /api/v1/tickets
GET    /api/v1/tickets
GET    /api/v1/tickets/{id}
PUT    /api/v1/tickets/{id}/status
PUT    /api/v1/tickets/{id}/assign
DELETE /api/v1/tickets/{id}
POST   /api/v1/tickets/{id}/comments
PUT    /api/v1/tickets/{id}/comments/{commentId}
DELETE /api/v1/tickets/{id}/comments/{commentId}
GET    /api/v1/tickets/{id}/attachments
GET    /api/v1/admin/tickets/sla-metrics
GET    /api/v1/admin/technician-workload
GET    /api/v1/admin/tickets/{id}/assignment-suggestion
```

### Related SQL Tables

Implemented/current:

- `tickets`
- `ticket_comments`
- `ticket_attachments`

Documented/planned:

- `ticket_status_history`

### Image Upload Implementation

This is the main implemented image upload part of the project.

Frontend:

- `ImageUploadPreview.tsx` accepts image files through file picker or drag-and-drop.
- It limits selected files to 3 images.
- `TicketForm.tsx` sends selected files with the ticket form.
- `ticketApi.ts` builds a `FormData` object and posts it as `multipart/form-data`.

Backend:

- `TicketController.createTicket()` accepts multipart form data.
- It receives the files using `@RequestParam(name = "files", required = false) List<MultipartFile> files`.
- `TicketService.createTicket()` validates the maximum file count.
- `TicketFileStorageService.store()` validates and stores each image.

Validation rules:

- maximum 3 files per ticket
- maximum 5 MB per file
- allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

Storage path:

```text
uploads/tickets/{ticketId}/{generatedFileName}
```

Public URL/path stored in database:

```text
/uploads/tickets/{ticketId}/{generatedFileName}
```

The file metadata is saved in the `ticket_attachments` table:

- original file name
- stored file path
- file size
- MIME type
- uploaded user
- created timestamp

`WebConfig` exposes uploaded files through:

```text
/uploads/**
```

### Innovation Area

The innovation in this module includes:

- image evidence upload for maintenance tickets
- SLA breach calculation based on response and resolution time
- technician workload analysis
- automatic assignment suggestion using lowest active workload
- internal comments visible only to admins and technicians
- role-scoped ticket visibility

## 8. Module D4: Authentication, Users, Notifications, and Security

Developer responsibility:

- User registration and login
- JWT access token and refresh token flow
- Google OAuth support
- Role-based access control
- Admin user management
- Notifications and notification preferences
- Security activity logs

### Frontend Files

```text
frontend/src/services/api/authApi.ts
frontend/src/services/api/notificationApi.ts
frontend/src/services/api/securityApi.ts
frontend/src/stores/authStore.ts
frontend/src/stores/notificationStore.ts
frontend/src/app/login/
frontend/src/app/notifications/
frontend/src/app/account/security/
frontend/src/app/admin/users/
```

### Backend Files

```text
backend/src/main/java/edu/sliit/smartcampus/controller/AuthController.java
backend/src/main/java/edu/sliit/smartcampus/controller/AdminUserController.java
backend/src/main/java/edu/sliit/smartcampus/controller/NotificationController.java
backend/src/main/java/edu/sliit/smartcampus/controller/SecurityActivityController.java
backend/src/main/java/edu/sliit/smartcampus/service/AuthService.java
backend/src/main/java/edu/sliit/smartcampus/service/NotificationService.java
backend/src/main/java/edu/sliit/smartcampus/service/SecurityActivityService.java
backend/src/main/java/edu/sliit/smartcampus/security/
```

### API Endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
GET  /api/v1/auth/bootstrap
POST /api/v1/auth/logout

GET   /api/v1/admin/users
PATCH /api/v1/admin/users/{id}/role
PATCH /api/v1/admin/users/{id}/status

GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PUT    /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/{id}
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
```

### Related SQL Tables

Implemented/current:

- `users`
- `refresh_tokens`
- `notifications`
- `notification_preferences`
- `security_activity_logs`

### Innovation Area

The innovation in this module includes:

- JWT access token and refresh token handling
- automatic token refresh from the frontend Axios client
- role-based route/dashboard bootstrap
- notification unread count
- user notification preferences
- suspicious security activity tracking
- admin-controlled user role and status management

### Image Upload Status

There is no custom image upload for this module.

The user model has an `avatarUrl` field. This is suitable for storing a profile image URL, especially one received from Google OAuth, but there is no local profile image upload workflow currently implemented.

## 9. SQL Ownership by Developer

| Developer | Module | Main Tables |
| --- | --- | --- |
| Dev 1 | Facilities and Resources | `resources`, `availability_windows`, `maintenance_blackouts`, `resource_amenities`, `resource_specifications` |
| Dev 2 | Booking Management | `bookings`, `waitlist_entries` |
| Dev 3 | Tickets and Maintenance | `tickets`, `ticket_comments`, `ticket_attachments` |
| Dev 4 | Auth, Users, Notifications | `users`, `refresh_tokens`, `notifications`, `notification_preferences`, `security_activity_logs` |

Documented but not fully represented by current Java entities:

| Planned Table | Module | Note |
| --- | --- | --- |
| `resource_images` | Dev 1 | Mentioned in documentation, but no current Java entity/upload workflow found |
| `booking_status_history` | Dev 2 | Mentioned in documentation, but no current Java entity found |
| `ticket_status_history` | Dev 3 | Mentioned in documentation, but no current Java entity found |

## 10. End-to-End Examples

### Example 1: Create Ticket With Images

```text
User fills ticket form
  -> TicketForm.tsx stores title, description, category, priority, location, files
  -> ImageUploadPreview.tsx previews selected images
  -> ticketApi.create() creates FormData
  -> POST /api/v1/tickets
  -> TicketController.createTicket()
  -> TicketService.createTicket()
  -> TicketFileStorageService.store()
  -> file saved under uploads/tickets/{ticketId}
  -> ticket row saved in tickets table
  -> attachment rows saved in ticket_attachments table
  -> notification sent to admins
  -> TicketDto returned to frontend
```

### Example 2: Create Booking

```text
User submits booking request
  -> bookingApi.create()
  -> POST /api/v1/bookings
  -> BookingController.createBooking()
  -> BookingService.validateDateTime()
  -> FacilityService.assertSlotBookable()
  -> BookingRepository checks approved conflicts
  -> booking saved as PENDING
  -> waitlist entry created if slot already has approved conflict
  -> notification created
  -> BookingDto returned to frontend
```

### Example 3: View Resource Availability

```text
User opens facility availability calendar
  -> facilityApi.getAvailability()
  -> GET /api/v1/resources/{id}/availability?from=...&to=...
  -> FacilityController.getAvailability()
  -> FacilityService.getAvailability()
  -> reads availability_windows
  -> reads maintenance_blackouts
  -> reads pending/approved bookings
  -> builds day-by-day slot list
  -> ResourceAvailabilityDto returned to frontend
```

### Example 4: Login and Authenticated Request

```text
User logs in
  -> authApi.login()
  -> POST /api/v1/auth/login
  -> AuthController.login()
  -> AuthService validates credentials
  -> access token and refresh token returned
  -> authStore stores tokens and user
  -> later API calls use Axios Authorization: Bearer {token}
  -> backend JwtAuthenticationFilter validates token
  -> controller/service can identify current user
```

## 11. Short Viva Explanation

Use this paragraph if you need to explain the system quickly:

```text
The frontend does not directly access the database. React pages call service files such as bookingApi, ticketApi, and facilityApi. These services use a shared Axios client that attaches the JWT token. The Spring Boot backend receives requests through controllers, applies business rules in services, and uses repositories to read and write JPA entities in the database. The response is converted into DTOs and returned as JSON to the frontend. The main innovation areas are booking conflict detection with waitlist and QR check-in, ticket image evidence upload, SLA tracking, technician workload analytics, and role-based notifications.
```

## 12. Key Files to Mention in Report

| Area | File |
| --- | --- |
| Axios/token flow | `frontend/src/lib/axios.ts` |
| Facility frontend API | `frontend/src/services/api/facilityApi.ts` |
| Booking frontend API | `frontend/src/services/api/bookingApi.ts` |
| Ticket frontend API | `frontend/src/services/api/ticketApi.ts` |
| Auth frontend API | `frontend/src/services/api/authApi.ts` |
| Notification frontend API | `frontend/src/services/api/notificationApi.ts` |
| Facility controller/service | `FacilityController.java`, `FacilityService.java` |
| Booking controller/service | `BookingController.java`, `BookingService.java` |
| Ticket controller/service | `TicketController.java`, `TicketService.java` |
| Ticket upload storage | `TicketFileStorageService.java` |
| Auth and user control | `AuthController.java`, `AdminUserController.java`, `AuthService.java` |
| Notifications | `NotificationController.java`, `NotificationService.java` |
| Security config | `SecurityConfig.java`, `JwtAuthenticationFilter.java` |
| Upload file serving | `WebConfig.java` |
| SQL schema | `backend/db/full_schemas.sql` |

