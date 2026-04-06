# Smart Campus Operations Hub - Workflow

## 1. Project Scenario

The Smart Campus Operations Hub is a role-based system for Students, Staff, Technicians, and Admins.
Users authenticate using email/password or Google OAuth, then access role-specific dashboards.
The platform manages facilities, bookings, incident tickets, and notifications with integrated workflows.

## 2. End-to-End Workflow

1. User signs up/signs in (Google or local auth).
2. Backend validates identity and issues JWT tokens.
3. User is redirected to role-based dashboard.
4. Admin manages resources and availability.
5. Student/Staff creates booking requests.
6. System checks conflicts and booking rules.
7. Admin approves/rejects bookings.
8. Approved bookings support QR check-in.
9. Student/Staff submits maintenance tickets.
10. Admin assigns technicians.
11. Technicians update statuses and comments.
12. Notifications are triggered for important events.
13. SLA/analytics/security data is shown on dashboards.

## 3. Module-Wise Workflow

### Module A - Facilities (Member 1)

1. Create/update/delete resources.
2. Configure availability windows.
3. Apply maintenance blackout periods.
4. Provide searchable facility catalogue.

### Module B - Bookings (Member 2)

1. Create booking request.
2. Run conflict validation.
3. Admin approval flow.
4. Generate and verify QR check-in.
5. Manage waitlist and auto-promotion.

### Module C - Tickets (Member 3)

1. Create ticket with priority/category and attachments.
2. Admin assigns technician.
3. Technician updates lifecycle and comments.
4. Track SLA metrics (first response and resolution).
5. Show technician workload and assignment suggestions.

### Module D/E - Notifications and Auth (Member 4)

1. Manage multi-role auth and OAuth integration.
2. Enforce role-based authorization.
3. Deliver notifications from booking/ticket events.
4. Support notification preferences.
5. Provide admin analytics and security alerts.

## 4. Dashboard Workflow by Role

### Student Dashboard

- My bookings
- My tickets
- Quick actions and notifications

### Staff Dashboard

- Department-related bookings
- Service requests
- Operational updates

### Technician Dashboard

- Assigned tickets
- SLA timers
- Workload summary

### Admin Dashboard

- Booking approvals
- Ticket assignment board
- User and role management
- Usage analytics and security alerts

## 5. New Feature Additions

- QR code check-in for approved bookings
- Admin usage analytics (top resources, peak booking hours)
- Ticket service-level timers (TTFR, TTR)
- Notification preferences (category-level controls)

## 6. Definition of Done

1. All module workflows are integrated and functioning.
2. Role-based dashboards are available for all user types.
3. New features are implemented and tested.
4. API docs, test evidence, and project report are completed.
