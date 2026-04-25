# Developer Database Schemas

This document splits the full database schema in `backend/db/full_schemas.sql` by developer/module responsibility. Use it for reports, viva explanations, and module handover.

The full schema uses the PostgreSQL schema name `smart_campus` and UUID primary keys generated with `gen_random_uuid()`.

## Full Schema Table Ownership

| Developer   | Module                               | Tables                                                                                           |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Developer 1 | Facilities and Resources             | `resources`, `availability_windows`, `maintenance_blackouts`, `resource_images`                  |
| Developer 2 | Bookings                             | `bookings`, `booking_status_history`, `waitlist_entries`                                         |
| Developer 3 | Maintenance Tickets                  | `tickets`, `ticket_comments`, `ticket_attachments`, `ticket_status_history`                      |
| Developer 4 | Auth, Users, Notifications, Security | `users`, `refresh_tokens`, `security_activity_logs`, `notifications`, `notification_preferences` |

Shared dependency note: most modules reference `users(id)`. Developer 2 also references `resources(id)`. Developer 3 references `users(id)` for reporter, assignee, comment author, and attachment uploader.

## Developer 1: Facilities and Resources

Purpose: manages the campus resource catalogue, operating hours, maintenance blocking, and resource images.

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  location VARCHAR(255),
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT resources_type_check CHECK (resource_type IN (
    'LECTURE_HALL','LAB','MEETING_ROOM','EQUIPMENT','FACILITY'
  )),
  CONSTRAINT resources_status_check CHECK (status IN (
    'ACTIVE','OUT_OF_SERVICE','UNDER_MAINTENANCE'
  )),
  CONSTRAINT resources_capacity_check CHECK (capacity > 0)
);

CREATE TABLE availability_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT availability_windows_time_check CHECK (end_time > start_time)
);

CREATE TABLE maintenance_blackouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT maintenance_blackouts_date_check CHECK (end_date > start_date)
);

CREATE TABLE resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

Key relationships:

| Relationship                                        | Meaning                                           |
| --------------------------------------------------- | ------------------------------------------------- |
| `availability_windows.resource_id -> resources.id`  | One resource has many weekly operating windows    |
| `maintenance_blackouts.resource_id -> resources.id` | One resource has many blocked maintenance periods |
| `maintenance_blackouts.created_by -> users.id`      | Maintenance blackout creator                      |
| `resource_images.resource_id -> resources.id`       | One resource has many images                      |

Important constraints:

| Constraint                         | Rule                                           |
| ---------------------------------- | ---------------------------------------------- |
| `resources_type_check`             | resource type must be an allowed module value  |
| `resources_status_check`           | resource status must be valid                  |
| `resources_capacity_check`         | capacity must be greater than zero             |
| `availability_windows_time_check`  | availability end time must be after start time |
| `maintenance_blackouts_date_check` | blackout end date must be after start date     |

## Developer 2: Booking Management

Purpose: manages booking requests, approval workflow, QR check-in, conflict detection, and waitlists.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id),
  booker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason VARCHAR(500),
  qr_token VARCHAR(255) UNIQUE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT bookings_time_check CHECK (end_time > start_time),
  CONSTRAINT bookings_date_check CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT bookings_status_check CHECK (status IN (
    'PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED'
  ))
);

CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
  promoted_to_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  promoted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT waitlist_entries_status_check CHECK (status IN (
    'WAITING','OFFERED','ACCEPTED','DECLINED','EXPIRED'
  ))
);
```

Key relationships:

| Relationship                                             | Meaning                                           |
| -------------------------------------------------------- | ------------------------------------------------- |
| `bookings.resource_id -> resources.id`                   | Booking is made for one resource                  |
| `bookings.booker_id -> users.id`                         | User who requested the booking                    |
| `bookings.approved_by -> users.id`                       | Admin/staff user who approved the booking         |
| `bookings.checked_in_by -> users.id`                     | User who verified QR check-in                     |
| `booking_status_history.booking_id -> bookings.id`       | Audit history for booking status changes          |
| `booking_status_history.changed_by -> users.id`          | User who changed booking status                   |
| `waitlist_entries.booking_id -> bookings.id`             | Waitlist entry belongs to a booking request       |
| `waitlist_entries.user_id -> users.id`                   | User waiting for a slot                           |
| `waitlist_entries.promoted_to_booking_id -> bookings.id` | Booking created/approved after waitlist promotion |

Important constraints:

| Constraint                      | Rule                                      |
| ------------------------------- | ----------------------------------------- |
| `bookings_time_check`           | booking end time must be after start time |
| `bookings_date_check`           | booking date cannot be in the past        |
| `bookings_status_check`         | booking status must be valid              |
| `waitlist_entries_status_check` | waitlist status must be valid             |
| `qr_token UNIQUE`               | each QR check-in token must be unique     |

## Developer 3: Maintenance and Incident Tickets

Purpose: manages maintenance ticket workflow, comments, internal notes, image/file evidence, SLA state, and ticket status audit.

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT tickets_category_check CHECK (category IN (
    'ELECTRICAL','PLUMBING','IT_EQUIPMENT','HVAC','STRUCTURAL','OTHER'
  )),
  CONSTRAINT tickets_priority_check CHECK (priority IN (
    'LOW','MEDIUM','HIGH','CRITICAL'
  )),
  CONSTRAINT tickets_status_check CHECK (status IN (
    'OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'
  ))
);

CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT ticket_attachments_size_check CHECK (file_size > 0)
);

CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

Key relationships:

| Relationship                                          | Meaning                                 |
| ----------------------------------------------------- | --------------------------------------- |
| `tickets.reporter_id -> users.id`                     | User who reported the incident          |
| `tickets.assignee_id -> users.id`                     | Technician assigned to the ticket       |
| `ticket_comments.ticket_id -> tickets.id`             | One ticket has many comments            |
| `ticket_comments.author_id -> users.id`               | User who wrote a comment                |
| `ticket_attachments.ticket_id -> tickets.id`          | One ticket has many attachments         |
| `ticket_attachments.comment_id -> ticket_comments.id` | Optional attachment linked to a comment |
| `ticket_attachments.uploaded_by -> users.id`          | User who uploaded the file              |
| `ticket_status_history.ticket_id -> tickets.id`       | Audit history for ticket status changes |
| `ticket_status_history.changed_by -> users.id`        | User who changed ticket status          |

Important constraints:

| Constraint                      | Rule                                           |
| ------------------------------- | ---------------------------------------------- |
| `ticket_number UNIQUE`          | each ticket has a unique human-readable number |
| `tickets_category_check`        | category must be valid                         |
| `tickets_priority_check`        | priority must be valid                         |
| `tickets_status_check`          | ticket status must be valid                    |
| `ticket_attachments_size_check` | uploaded file size must be greater than zero   |

## Developer 4: Authentication, Users, Notifications, and Security

Purpose: manages users, login sessions, refresh tokens, notification delivery, notification preferences, and security activity logs.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT users_role_check CHECK (role IN ('STUDENT','STAFF','TECHNICIAN','ADMIN')),
  CONSTRAINT users_status_check CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED'))
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT refresh_tokens_expires_gt_created CHECK (expires_at > created_at)
);

CREATE TABLE security_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  location VARCHAR(255),
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT security_activity_logs_event_type_check
  CHECK (event_type IN ('LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','TOKEN_REFRESH'))
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  entity_type VARCHAR(50),
  entity_id UUID,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT notifications_type_check CHECK (notification_type IN (
    'BOOKING_APPROVED','BOOKING_REJECTED','BOOKING_CANCELLED',
    'TICKET_ASSIGNED','TICKET_UPDATED','TICKET_RESOLVED',
    'SECURITY_ALERT','REMINDER','GENERAL'
  ))
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  booking_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ticket_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  security_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  general_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

Key relationships:

| Relationship                                   | Meaning                           |
| ---------------------------------------------- | --------------------------------- |
| `refresh_tokens.user_id -> users.id`           | One user has many refresh tokens  |
| `security_activity_logs.user_id -> users.id`   | One user has many security events |
| `notifications.user_id -> users.id`            | One user has many notifications   |
| `notification_preferences.user_id -> users.id` | One user has one preference row   |

Important constraints:

| Constraint                                | Rule                                                      |
| ----------------------------------------- | --------------------------------------------------------- |
| `users.email UNIQUE`                      | email must be unique                                      |
| `users.oauth_id UNIQUE`                   | OAuth account id must be unique                           |
| `users_role_check`                        | role must be `STUDENT`, `STAFF`, `TECHNICIAN`, or `ADMIN` |
| `users_status_check`                      | status must be `ACTIVE`, `INACTIVE`, or `SUSPENDED`       |
| `refresh_tokens_expires_gt_created`       | refresh token expiry must be later than creation time     |
| `security_activity_logs_event_type_check` | security event type must be valid                         |
| `notifications_type_check`                | notification type must be valid                           |
| `notification_preferences.user_id UNIQUE` | only one preference row per user                          |

## Cross-Developer Foreign Key Map

| From Table                          | To Table             | Used By             |
| ----------------------------------- | -------------------- | ------------------- |
| `maintenance_blackouts.created_by`  | `users.id`           | Dev 1 + Dev 4       |
| `bookings.resource_id`              | `resources.id`       | Dev 2 + Dev 1       |
| `bookings.booker_id`                | `users.id`           | Dev 2 + Dev 4       |
| `bookings.approved_by`              | `users.id`           | Dev 2 + Dev 4       |
| `bookings.checked_in_by`            | `users.id`           | Dev 2 + Dev 4       |
| `booking_status_history.changed_by` | `users.id`           | Dev 2 + Dev 4       |
| `waitlist_entries.user_id`          | `users.id`           | Dev 2 + Dev 4       |
| `tickets.reporter_id`               | `users.id`           | Dev 3 + Dev 4       |
| `tickets.assignee_id`               | `users.id`           | Dev 3 + Dev 4       |
| `ticket_comments.author_id`         | `users.id`           | Dev 3 + Dev 4       |
| `ticket_attachments.uploaded_by`    | `users.id`           | Dev 3 + Dev 4       |
| `ticket_status_history.changed_by`  | `users.id`           | Dev 3 + Dev 4       |
| `notifications.entity_id`           | any module entity id | Dev 4 + all modules |

## Short Explanation for Viva

Developer 1 owns the resource master data, operating hours, maintenance blackout, and image tables. Developer 2 owns booking requests, status audit, waitlist, QR token, and check-in data. Developer 3 owns ticket, comment, attachment, SLA, and ticket workflow data. Developer 4 owns the shared user identity tables, refresh tokens, notifications, notification preferences, and security activity logs. The shared `users` table connects to all modules, while `resources` connects Developer 1 and Developer 2 through bookings.
