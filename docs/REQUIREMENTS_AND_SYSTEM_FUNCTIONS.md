# Smart Campus Operations Hub - Requirements and System Functions

## 1. Project Overview

Smart Campus Operations Hub is a full-stack campus operations platform for managing university facilities, booking requests, maintenance incidents, notifications, and role-based user access. The system uses a React frontend, a Spring Boot REST API backend, JWT-based authentication, and a relational database.

The main users of the system are students, staff members, administrators, technicians, and guests. The platform helps campus users browse available facilities, request bookings, report maintenance issues, receive notifications, and track operational activity through dashboards.

## 2. Main Actors

| Actor           | Description                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Guest           | Unauthenticated visitor who can browse public facility information.                                                             |
| Student / Staff | Authenticated campus user who can create bookings, report issues, view notifications, and manage personal activity.             |
| Admin           | Administrative user who manages facilities, bookings, users, tickets, analytics, and system operations.                         |
| Technician      | Maintenance user who views assigned tickets, updates repair progress, adds comments, and resolves issues.                       |
| System          | Automated backend processes that validate requests, generate notifications, calculate availability, and enforce security rules. |

## 3. Functional Requirements

### 3.1 Authentication and User Management

| ID    | Functional Requirement                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------- |
| FR-01 | The system shall allow users to register and log in using valid credentials.                             |
| FR-02 | The system shall support Google OAuth 2.0 authentication for user sign-in.                               |
| FR-03 | The system shall issue JWT access tokens and refresh tokens after successful authentication.             |
| FR-04 | The system shall allow authenticated users to view their own profile details.                            |
| FR-05 | The system shall allow users to log out and invalidate the active session.                               |
| FR-06 | The system shall automatically refresh expired access tokens when a valid refresh token exists.          |
| FR-07 | The system shall maintain user roles such as STUDENT, STAFF, ADMIN, and TECHNICIAN.                      |
| FR-08 | The system shall allow admins to view all users.                                                         |
| FR-09 | The system shall allow admins to update user roles.                                                      |
| FR-10 | The system shall allow admins to activate, suspend, or update user account status.                       |
| FR-11 | The system shall restrict protected functions based on authenticated user role.                          |
| FR-12 | The system shall record security activity such as login, logout, failed login, and token refresh events. |

### 3.2 Facilities and Resource Management

| ID    | Functional Requirement                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| FR-13 | The system shall display a public catalogue of campus resources such as lecture halls, labs, meeting rooms, and equipment.         |
| FR-14 | The system shall allow users to search resources by name or description.                                                           |
| FR-15 | The system shall allow users to filter resources by type, status, capacity, and location.                                          |
| FR-16 | The system shall allow users to view detailed information about a selected resource.                                               |
| FR-17 | The system shall show resource details such as name, type, capacity, status, location, description, amenities, and specifications. |
| FR-18 | The system shall allow admins to create new resources.                                                                             |
| FR-19 | The system shall allow admins to update existing resource information.                                                             |
| FR-20 | The system shall allow admins to soft-delete resources when they do not have active bookings.                                      |
| FR-21 | The system shall prevent deletion of resources with active or conflicting operational records.                                     |
| FR-22 | The system shall allow admins to configure availability windows for resources.                                                     |
| FR-23 | The system shall allow admins to create and remove maintenance blackout periods.                                                   |
| FR-24 | The system shall calculate resource availability using operating hours, bookings, resource status, and maintenance blackouts.      |
| FR-25 | The system shall display available, occupied, blocked, and unavailable time slots for resources.                                   |

### 3.3 Booking Management

| ID    | Functional Requirement                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| FR-26 | The system shall allow authenticated students and staff to create booking requests for available resources.                    |
| FR-27 | The system shall validate booking date, start time, end time, duration, and purpose before creating a booking.                 |
| FR-28 | The system shall prevent bookings for resources that are inactive, under maintenance, or outside availability windows.         |
| FR-29 | The system shall check for booking conflicts before accepting or approving a booking.                                          |
| FR-30 | The system shall allow users to preview booking conflicts before submitting a booking.                                         |
| FR-31 | The system shall suggest alternative time slots when a requested booking conflicts with an existing approved booking.          |
| FR-32 | The system shall create bookings with an initial pending status when approval is required.                                     |
| FR-33 | The system shall allow users to view their own bookings.                                                                       |
| FR-34 | The system shall allow users to cancel their own pending or approved bookings when cancellation rules permit.                  |
| FR-35 | The system shall allow admins to view all bookings across the system.                                                          |
| FR-36 | The system shall allow admins to approve pending bookings.                                                                     |
| FR-37 | The system shall allow admins to reject booking requests with a reason.                                                        |
| FR-38 | The system shall allow admins to cancel bookings with an administrative reason.                                                |
| FR-39 | The system shall generate a QR token for approved bookings.                                                                    |
| FR-40 | The system shall allow QR-based booking check-in using a valid QR token.                                                       |
| FR-41 | The system shall maintain a waitlist for conflicting booking requests where applicable.                                        |
| FR-42 | The system shall automatically promote waitlisted bookings when an approved booking is cancelled and a slot becomes available. |

### 3.4 Maintenance and Incident Ticketing

| ID    | Functional Requirement                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| FR-43 | The system shall allow authenticated users to report maintenance incidents for campus resources.                  |
| FR-44 | The system shall require ticket details such as title, description, category, priority, and location or resource. |
| FR-45 | The system shall allow users to upload image evidence when creating a maintenance ticket.                         |
| FR-46 | The system shall validate ticket image uploads by file type, file size, and maximum file count.                   |
| FR-47 | The system shall store ticket attachment metadata and make uploaded evidence accessible through the application.  |
| FR-48 | The system shall generate and store a unique ticket record for every incident report.                             |
| FR-49 | The system shall allow users to view their own reported tickets.                                                  |
| FR-50 | The system shall allow admins to view all tickets.                                                                |
| FR-51 | The system shall allow technicians to view tickets assigned to them.                                              |
| FR-52 | The system shall allow admins to assign technicians to tickets.                                                   |
| FR-53 | The system shall suggest a technician based on current workload.                                                  |
| FR-54 | The system shall allow admins and assigned technicians to update ticket status.                                   |
| FR-55 | The system shall support ticket statuses such as OPEN, IN_PROGRESS, RESOLVED, CLOSED, and REJECTED.               |
| FR-56 | The system shall allow authorized users to add comments to tickets.                                               |
| FR-57 | The system shall support internal ticket comments visible only to admins and technicians.                         |
| FR-58 | The system shall calculate SLA response and resolution status based on ticket priority and time.                  |
| FR-59 | The system shall provide admin metrics for SLA performance and technician workload.                               |

### 3.5 Notifications

| ID    | Functional Requirement                                                                            |
| ----- | ------------------------------------------------------------------------------------------------- |
| FR-60 | The system shall create notifications for important booking, ticket, security, and system events. |
| FR-61 | The system shall notify users when their booking is approved, rejected, or cancelled.             |
| FR-62 | The system shall notify admins when new booking requests or important tickets are created.        |
| FR-63 | The system shall notify technicians when a ticket is assigned to them.                            |
| FR-64 | The system shall notify ticket reporters when ticket status or comments are updated.              |
| FR-65 | The system shall allow users to view their notifications.                                         |
| FR-66 | The system shall display unread notification count.                                               |
| FR-67 | The system shall allow users to mark a single notification as read.                               |
| FR-68 | The system shall allow users to mark all notifications as read.                                   |
| FR-69 | The system shall allow users to delete notifications.                                             |
| FR-70 | The system shall allow users to manage notification preferences.                                  |

### 3.6 Admin Dashboard and Analytics

| ID    | Functional Requirement                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| FR-71 | The system shall provide role-based dashboard routes for students, staff, admins, and technicians.           |
| FR-72 | The system shall provide an admin dashboard for operational overview.                                        |
| FR-73 | The system shall show booking statistics and resource usage analytics to admins.                             |
| FR-74 | The system shall show ticket statistics, SLA metrics, and technician workload analytics to admins.           |
| FR-75 | The system shall show security activity and suspicious activity indicators to authorized users.              |
| FR-76 | The system shall provide quick access to resource, booking, ticket, user, and notification management pages. |

## 4. Non-Functional Requirements

| ID     | Non-Functional Requirement                                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | The system shall be implemented as a full-stack web application using React for the frontend and Spring Boot for the backend.                                               |
| NFR-02 | The system shall expose backend functions through RESTful API endpoints under a versioned API path.                                                                         |
| NFR-03 | The system shall use a relational database to persist users, resources, bookings, tickets, notifications, and audit data.                                                   |
| NFR-04 | The system shall protect private API endpoints using JWT authentication.                                                                                                    |
| NFR-05 | The system shall enforce role-based authorization for admin, technician, student, and staff functions.                                                                      |
| NFR-06 | The system shall validate all client input on the backend before saving data.                                                                                               |
| NFR-07 | The system shall return clear HTTP status codes such as 200, 201, 204, 400, 401, 403, 404, 409, and 500.                                                                    |
| NFR-08 | The system shall handle errors through a centralized exception handling mechanism.                                                                                          |
| NFR-09 | The system shall store passwords and credentials securely and shall not expose sensitive tokens in API responses beyond the required authentication flow.                   |
| NFR-10 | The system shall support secure OAuth-based login through Google where configured.                                                                                          |
| NFR-11 | The system shall prevent unauthorized users from accessing another user's private bookings, tickets, notifications, and security logs.                                      |
| NFR-12 | The system shall maintain security activity logs for auditability.                                                                                                          |
| NFR-13 | The system shall use pagination for list endpoints to support large data sets.                                                                                              |
| NFR-14 | The system shall support filtering and searching to improve usability on large resource, booking, ticket, and user lists.                                                   |
| NFR-15 | The system shall use database indexes and query methods suitable for common lookup operations such as resource search, booking conflict checks, and notification retrieval. |
| NFR-16 | The system shall provide a responsive frontend interface that works on common desktop and mobile screen sizes.                                                              |
| NFR-17 | The system shall use reusable frontend components and hooks to maintain consistency across pages.                                                                           |
| NFR-18 | The system shall keep frontend API communication centralized through service files and a shared Axios client.                                                               |
| NFR-19 | The system shall separate backend responsibilities into controller, service, repository, model, DTO, security, and configuration layers.                                    |
| NFR-20 | The system shall support maintainability by organizing features into clear modules: facilities, bookings, tickets, auth/users, notifications, and analytics.                |
| NFR-21 | The system shall support file upload safety by limiting ticket evidence file type, size, and count.                                                                         |
| NFR-22 | The system shall avoid permanent deletion of important operational records where soft deletion is required.                                                                 |
| NFR-23 | The system shall support testability through backend unit and integration tests.                                                                                            |
| NFR-24 | The system shall provide documentation for API endpoints, database structure, module responsibilities, and workflows.                                                       |
| NFR-25 | The system shall be configurable through environment-specific backend and frontend configuration values.                                                                    |

## 5. System Functions

### 5.1 Public System Functions

| Function ID | Function                    | Description                                                                         |
| ----------- | --------------------------- | ----------------------------------------------------------------------------------- |
| SF-01       | Browse Resource Catalogue   | Displays available campus resources to guests and authenticated users.              |
| SF-02       | Search and Filter Resources | Allows users to locate facilities by keyword, type, status, capacity, and location. |
| SF-03       | View Resource Details       | Shows detailed information about a selected facility or asset.                      |
| SF-04       | Login / Register            | Authenticates users and creates valid sessions.                                     |

### 5.2 Student and Staff Functions

| Function ID | Function                        | Description                                                                             |
| ----------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| SF-05       | View Dashboard                  | Shows a role-based dashboard after login.                                               |
| SF-06       | Check Resource Availability     | Displays time slots for selected resources.                                             |
| SF-07       | Create Booking Request          | Allows users to request a facility or asset for a selected time period.                 |
| SF-08       | Preview Booking Conflict        | Checks whether a requested booking overlaps with existing bookings or blackout periods. |
| SF-09       | View My Bookings                | Lists all bookings created by the logged-in user.                                       |
| SF-10       | Cancel Own Booking              | Allows a user to cancel eligible pending or approved bookings.                          |
| SF-11       | View Booking QR Code            | Displays the generated QR code/token for approved bookings.                             |
| SF-12       | Report Maintenance Issue        | Allows users to create maintenance tickets for campus resources.                        |
| SF-13       | Upload Ticket Evidence          | Allows users to attach images to a maintenance ticket.                                  |
| SF-14       | View My Tickets                 | Shows the logged-in user's reported tickets.                                            |
| SF-15       | Add Ticket Comment              | Allows authorized users to add comments to ticket discussions.                          |
| SF-16       | View Notifications              | Displays booking, ticket, system, and security notifications.                           |
| SF-17       | Manage Notification Preferences | Allows users to enable or disable notification categories.                              |
| SF-18       | View Account Security Activity  | Shows recent authentication activity for the user.                                      |

### 5.3 Admin Functions

| Function ID | Function                     | Description                                                           |
| ----------- | ---------------------------- | --------------------------------------------------------------------- |
| SF-19       | Manage Resources             | Creates, updates, deletes, and configures campus resources.           |
| SF-20       | Manage Availability Windows  | Defines regular operating windows for each resource.                  |
| SF-21       | Manage Maintenance Blackouts | Blocks resource availability during maintenance periods.              |
| SF-22       | View All Bookings            | Shows all booking records across users and resources.                 |
| SF-23       | Approve Booking              | Approves a pending booking after conflict validation.                 |
| SF-24       | Reject Booking               | Rejects a booking request with a reason.                              |
| SF-25       | Cancel Any Booking           | Cancels bookings for operational or administrative reasons.           |
| SF-26       | Manage Tickets               | Views, filters, assigns, updates, and closes maintenance tickets.     |
| SF-27       | Assign Technician            | Assigns a technician to a selected maintenance ticket.                |
| SF-28       | View Assignment Suggestion   | Shows technician assignment recommendation based on workload.         |
| SF-29       | View SLA Metrics             | Displays ticket response and resolution performance.                  |
| SF-30       | View Technician Workload     | Displays active and overdue ticket counts by technician.              |
| SF-31       | Manage Users                 | Views users and updates role or account status.                       |
| SF-32       | View Admin Analytics         | Displays resource usage, booking activity, and operational summaries. |
| SF-33       | Review Security Activity     | Reviews suspicious or important authentication events.                |

### 5.4 Technician Functions

| Function ID | Function                   | Description                                                                       |
| ----------- | -------------------------- | --------------------------------------------------------------------------------- |
| SF-34       | View Assigned Tickets      | Shows tickets assigned to the logged-in technician.                               |
| SF-35       | Update Ticket Status       | Changes ticket progress such as OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED. |
| SF-36       | Add Technician Comment     | Adds public or internal progress comments to a ticket.                            |
| SF-37       | View Ticket Evidence       | Allows technicians to inspect uploaded issue images.                              |
| SF-38       | Resolve Maintenance Ticket | Marks a maintenance issue as resolved after work is complete.                     |

### 5.5 Automated Backend Functions

| Function ID | Function                      | Description                                                                                           |
| ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| SF-39       | Validate Authentication Token | Verifies JWT tokens before allowing protected API access.                                             |
| SF-40       | Enforce Role Access           | Blocks users from functions outside their assigned role.                                              |
| SF-41       | Calculate Availability        | Combines resource status, operating windows, bookings, and blackouts to determine available slots.    |
| SF-42       | Detect Booking Conflicts      | Finds overlapping approved or pending bookings.                                                       |
| SF-43       | Suggest Alternative Slots     | Finds available time slots when a booking conflict exists.                                            |
| SF-44       | Manage Waitlist Promotion     | Promotes the next eligible waitlisted booking when a slot becomes available.                          |
| SF-45       | Generate QR Tokens            | Creates a QR token for approved bookings.                                                             |
| SF-46       | Validate QR Check-In          | Confirms that a booking check-in uses a valid token.                                                  |
| SF-47       | Store Uploaded Ticket Files   | Validates and stores ticket evidence images.                                                          |
| SF-48       | Calculate SLA Status          | Determines response and resolution breach status for tickets.                                         |
| SF-49       | Generate Notifications        | Creates notifications when key booking, ticket, security, or system events occur.                     |
| SF-50       | Count Unread Notifications    | Calculates unread notification totals for dashboard and navbar display.                               |
| SF-51       | Log Security Events           | Stores authentication and suspicious activity logs.                                                   |
| SF-52       | Return Standard API Errors    | Converts validation, authorization, not found, conflict, and server errors into consistent responses. |

## 6. Core Modules Summary

| Module                   | Main Purpose                                                                         | Key Users                         |
| ------------------------ | ------------------------------------------------------------------------------------ | --------------------------------- |
| Authentication and Users | Login, registration, JWT sessions, OAuth, roles, user administration, security logs. | All users, Admin                  |
| Facilities and Resources | Resource catalogue, resource CRUD, availability windows, maintenance blackouts.      | Guest, Student, Staff, Admin      |
| Booking Management       | Booking requests, conflict detection, approval workflow, waitlist, QR check-in.      | Student, Staff, Admin             |
| Maintenance Tickets      | Incident reporting, evidence upload, assignment, comments, SLA tracking.             | Student, Staff, Admin, Technician |
| Notifications            | Event notifications, unread counts, read status, preferences.                        | All authenticated users           |
| Analytics and Dashboards | Role-based dashboards, booking analytics, ticket SLA metrics, workload summaries.    | Admin, Technician, Student, Staff |

## 7. Business Rules

| ID    | Business Rule                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------- |
| BR-01 | Only authenticated users can create bookings, report tickets, view notifications, and access dashboards. |
| BR-02 | Guests can only access public resource catalogue and resource detail information.                        |
| BR-03 | Only admins can create, update, or delete resources.                                                     |
| BR-04 | A resource cannot be booked if it is under maintenance or out of service.                                |
| BR-05 | A booking end time must be after its start time.                                                         |
| BR-06 | A booking must not overlap with an approved booking for the same resource.                               |
| BR-07 | A booking must not overlap with a maintenance blackout period.                                           |
| BR-08 | Only admins can approve or reject booking requests.                                                      |
| BR-09 | Rejected bookings must include a reason.                                                                 |
| BR-10 | Users can only cancel bookings they own, while admins can cancel any booking.                            |
| BR-11 | Ticket image evidence must follow configured file type, size, and count limits.                          |
| BR-12 | Users can view only their own tickets unless they are admins or authorized technicians.                  |
| BR-13 | Only admins can assign technicians to maintenance tickets.                                               |
| BR-14 | Internal ticket comments are visible only to admins and technicians.                                     |
| BR-15 | Notifications must belong to the authenticated user requesting them.                                     |
| BR-16 | User role and account status changes are restricted to admins.                                           |

## 8. Data Entities

| Entity                  | Purpose                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| User                    | Stores account, role, status, profile, and authentication-related user data.          |
| Refresh Token           | Stores refresh token/session information.                                             |
| Resource                | Stores campus facility or equipment details.                                          |
| Availability Window     | Stores regular available time periods for resources.                                  |
| Maintenance Blackout    | Stores temporary resource unavailability periods.                                     |
| Booking                 | Stores booking requests, status, user, resource, time range, QR token, and decisions. |
| Waitlist Entry          | Stores queued booking requests for conflicted slots.                                  |
| Ticket                  | Stores maintenance incident reports and workflow status.                              |
| Ticket Comment          | Stores public and internal comments for maintenance tickets.                          |
| Ticket Attachment       | Stores metadata for uploaded evidence images.                                         |
| Notification            | Stores user-facing event notifications.                                               |
| Notification Preference | Stores per-user notification settings.                                                |
| Security Activity Log   | Stores login, logout, token, and suspicious activity records.                         |
