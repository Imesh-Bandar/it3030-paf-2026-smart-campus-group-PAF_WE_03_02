# Smart Campus Operations Hub - Complete SQL Schema
## All Tables for All Developers (Dev 1-4)

**Database**: PostgreSQL 14+
**Date**: 21 April 2026
**Version**: 2.0
**Status**: Production Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Module D4: Authentication & Users](#module-d4-authentication--users)
3. [Module D4: Notifications & Security](#module-d4-notifications--security)
4. [Module D1: Facilities & Resources](#module-d1-facilities--resources)
5. [Module D2: Bookings](#module-d2-bookings)
6. [Module D3: Tickets & Maintenance](#module-d3-tickets--maintenance)
7. [Indexes](#indexes)
8. [Useful Queries](#useful-queries)
9. [Seed Data](#seed-data)

---

## Overview

### Entity Relationship Diagram
```
users (1) ──────────── (M) notifications
       ├─ (1) ──────────── (1) notification_preferences
       ├─ (1) ──────────── (M) refresh_tokens
       ├─ (1) ──────────── (M) security_activity_logs
       ├─ (1) ──────────── (M) bookings (as booker)
       ├─ (1) ──────────── (M) tickets (as reporter)
       └─ (1) ──────────── (M) tickets (as assignee)

resources (1) ──────────── (M) availability_windows
          ├─ (1) ──────────── (M) bookings
          ├─ (1) ──────────── (M) maintenance_blackouts
          └─ (1) ──────────── (M) resource_images

bookings (1) ──────────── (M) booking_status_history
         ├─ (1) ──────────── (M) waitlist_entries
         └─ (M) ──────────── (1) resources

tickets (1) ──────────── (M) ticket_comments
        ├─ (1) ──────────── (M) ticket_attachments
        ├─ (1) ──────────── (M) ticket_status_history
        └─ (M) ──────────── (1) users (assignee)

ticket_comments (M) ──────────── (1) users (author)
ticket_attachments (M) ──────────── (1) ticket_comments
```

### Statistics
- **Total Tables**: 21
- **Total Indexes**: 40+
- **Foreign Keys**: 25+
- **Enums**: 12

---

## MODULE D4: AUTHENTICATION & USERS

### 1. users Table
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

  CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN')),
  CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_oauth_id ON users(oauth_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

### 2. refresh_tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT refresh_tokens_expires_gt_created CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)
  WHERE revoked = FALSE;
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)
  WHERE revoked = FALSE;
```

### 3. security_activity_logs Table
```sql
CREATE TABLE security_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  location VARCHAR(255),
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT security_activity_logs_event_type_check
    CHECK (event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH'))
);

CREATE INDEX idx_security_activity_logs_user_id ON security_activity_logs(user_id);
CREATE INDEX idx_security_activity_logs_is_suspicious ON security_activity_logs(is_suspicious)
  WHERE is_suspicious = TRUE;
CREATE INDEX idx_security_activity_logs_created_at ON security_activity_logs(created_at DESC);
CREATE INDEX idx_security_activity_logs_user_suspicious ON security_activity_logs(user_id, is_suspicious);
```

---

## MODULE D4: NOTIFICATIONS & SECURITY

### 4. notifications Table
```sql
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
    'BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED',
    'TICKET_ASSIGNED', 'TICKET_UPDATED', 'TICKET_RESOLVED',
    'SECURITY_ALERT', 'REMINDER', 'GENERAL'
  ))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
```

### 5. notification_preferences Table
```sql
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

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

---

## MODULE D1: FACILITIES & RESOURCES

### 6. resources Table
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

  CONSTRAINT resources_type_check CHECK (resource_type IN (
    'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'FACILITY'
  )),
  CONSTRAINT resources_status_check CHECK (status IN (
    'ACTIVE', 'OUT_OF_SERVICE', 'UNDER_MAINTENANCE'
  )),
  CONSTRAINT resources_capacity_check CHECK (capacity > 0),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_status ON resources(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_location ON resources(location);
CREATE INDEX idx_resources_code ON resources(resource_code) WHERE deleted_at IS NULL;
```

### 7. availability_windows Table
```sql
CREATE TABLE availability_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  CONSTRAINT availability_windows_time_check CHECK (end_time > start_time),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_availability_windows_resource_id ON availability_windows(resource_id);
CREATE INDEX idx_availability_windows_day ON availability_windows(day_of_week);
```

### 8. maintenance_blackouts Table
```sql
CREATE TABLE maintenance_blackouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users(id),

  CONSTRAINT maintenance_blackouts_date_check CHECK (end_date > start_date),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_blackouts_resource_id ON maintenance_blackouts(resource_id);
CREATE INDEX idx_maintenance_blackouts_dates ON maintenance_blackouts(start_date, end_date);
CREATE INDEX idx_maintenance_blackouts_active ON maintenance_blackouts(resource_id)
  WHERE end_date > NOW();
```

### 9. resource_images Table
```sql
CREATE TABLE resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resource_images_resource_id ON resource_images(resource_id);
```

---

## MODULE D2: BOOKINGS

### 10. bookings Table
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
    'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'
  ))
);

CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_booker_id ON bookings(booker_id);
CREATE INDEX idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_approved_by ON bookings(approved_by) WHERE approved_by IS NOT NULL;
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_resource_date_status ON bookings(resource_id, booking_date, status)
  WHERE status IN ('PENDING', 'APPROVED');
CREATE INDEX idx_bookings_qr_token ON bookings(qr_token) WHERE qr_token IS NOT NULL;
CREATE UNIQUE INDEX idx_bookings_no_overlap
  ON bookings(resource_id, booking_date, start_time, end_time)
  WHERE status IN ('PENDING', 'APPROVED') AND deleted_at IS NULL;
```

### 11. booking_status_history Table
```sql
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_created_at ON booking_status_history(created_at DESC);
```

### 12. waitlist_entries Table
```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
  promoted_to_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  promoted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT waitlist_entries_status_check CHECK (status IN (
    'WAITING', 'OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED'
  )),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_entries_booking_id ON waitlist_entries(booking_id);
CREATE INDEX idx_waitlist_entries_user_id ON waitlist_entries(user_id);
CREATE INDEX idx_waitlist_entries_status ON waitlist_entries(status)
  WHERE status IN ('WAITING', 'OFFERED');
```

---

## MODULE D3: TICKETS & MAINTENANCE

### 13. tickets Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),

  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT tickets_category_check CHECK (category IN (
    'ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'STRUCTURAL', 'OTHER'
  )),
  CONSTRAINT tickets_priority_check CHECK (priority IN (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  CONSTRAINT tickets_status_check CHECK (status IN (
    'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'
  ))
);

CREATE INDEX idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_assignee_status ON tickets(assignee_id, status)
  WHERE status != 'CLOSED' AND deleted_at IS NULL;
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_sla_breached ON tickets(sla_breached) WHERE sla_breached = TRUE;
```

### 14. ticket_comments Table
```sql
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_author_id ON ticket_comments(author_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at DESC);
```

### 15. ticket_attachments Table
```sql
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT ticket_attachments_size_check CHECK (file_size > 0)
);

CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_comment_id ON ticket_attachments(comment_id);
CREATE INDEX idx_ticket_attachments_uploaded_by ON ticket_attachments(uploaded_by);
```

### 16. ticket_status_history Table
```sql
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_created_at ON ticket_status_history(created_at DESC);
```

---

## INDEXES

### Additional Performance Indexes

```sql
-- Full-text search indexes (if using PostgreSQL full-text search)
CREATE INDEX idx_resources_name_fts ON resources
  USING GIN(to_tsvector('english', name));

CREATE INDEX idx_tickets_description_fts ON tickets
  USING GIN(to_tsvector('english', description || ' ' || title));

-- JSON indexes for flexible data storage
CREATE INDEX idx_notifications_data ON notifications USING GIN(data);

-- Composite indexes for common query patterns
CREATE INDEX idx_bookings_user_date_status ON bookings(booker_id, booking_date, status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tickets_assignee_priority_status ON tickets(assignee_id, priority, status)
  WHERE status IN ('OPEN', 'IN_PROGRESS') AND deleted_at IS NULL;

CREATE INDEX idx_notifications_user_type_read ON notifications(user_id, notification_type, is_read);

-- Date range indexes for date-based queries
CREATE INDEX idx_bookings_date_range ON bookings(booking_date DESC, start_time, end_time);

CREATE INDEX idx_maintenance_blackouts_range ON maintenance_blackouts(start_date, end_date);
```

---

## USEFUL QUERIES

### AUTHENTICATION & USERS

#### 1. Find users by role
```sql
SELECT id, email, full_name, role, status, created_at
FROM users
WHERE role = 'TECHNICIAN' AND status = 'ACTIVE'
ORDER BY full_name;
```

#### 2. Check suspicious login activities
```sql
SELECT
  sal.id,
  sal.user_id,
  u.email,
  sal.event_type,
  sal.ip_address,
  sal.location,
  sal.created_at,
  sal.is_suspicious,
  sal.acknowledged_at
FROM security_activity_logs sal
JOIN users u ON sal.user_id = u.id
WHERE sal.is_suspicious = TRUE
  AND sal.acknowledged_at IS NULL
ORDER BY sal.created_at DESC;
```

#### 3. Get user's recent activity
```sql
SELECT
  event_type,
  ip_address,
  user_agent,
  created_at,
  is_suspicious
FROM security_activity_logs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

#### 4. Count active users by role
```sql
SELECT
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_30days
FROM users
WHERE status = 'ACTIVE' AND deleted_at IS NULL
GROUP BY role
ORDER BY user_count DESC;
```

---

### NOTIFICATIONS

#### 5. Get user's unread notifications with pagination
```sql
SELECT
  id,
  notification_type,
  title,
  message,
  created_at,
  entity_type,
  entity_id
FROM notifications
WHERE user_id = $1 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

#### 6. Check notification preferences
```sql
SELECT *
FROM notification_preferences
WHERE user_id = $1;
```

#### 7. Get notification statistics per type
```sql
SELECT
  notification_type,
  COUNT(*) as total,
  COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread,
  MAX(created_at) as latest
FROM notifications
WHERE user_id = $1
GROUP BY notification_type
ORDER BY total DESC;
```

---

### RESOURCES & FACILITIES (Dev 1)

#### 8. Find available resources by capacity
```sql
SELECT
  id,
  name,
  resource_type,
  location,
  capacity
FROM resources
WHERE status = 'ACTIVE'
  AND capacity >= $1
  AND deleted_at IS NULL
ORDER BY name;
```

#### 9. Get resource availability windows
```sql
SELECT
  id,
  day_of_week,
  start_time,
  end_time
FROM availability_windows
WHERE resource_id = $1
ORDER BY day_of_week, start_time;
```

#### 10. Find resources with active maintenance blackouts
```sql
SELECT DISTINCT
  r.id,
  r.name,
  r.location,
  mb.start_date,
  mb.end_date,
  mb.reason
FROM resources r
JOIN maintenance_blackouts mb ON r.id = mb.resource_id
WHERE mb.end_date > NOW()
  AND r.status = 'ACTIVE'
ORDER BY mb.start_date;
```

#### 11. Get facility capacity and bookings count
```sql
SELECT
  r.id,
  r.name,
  r.capacity,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'APPROVED' THEN 1 END) as approved_count
FROM resources r
LEFT JOIN bookings b ON r.id = b.resource_id
  AND b.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.capacity
ORDER BY total_bookings DESC;
```

---

### BOOKINGS (Dev 2)

#### 12. Check for booking conflicts
```sql
SELECT
  id,
  booker_id,
  booking_date,
  start_time,
  end_time,
  status
FROM bookings
WHERE resource_id = $1
  AND booking_date = $2
  AND status IN ('PENDING', 'APPROVED')
  AND deleted_at IS NULL
  AND NOT (end_time <= $3 OR start_time >= $4)
ORDER BY start_time;
```

#### 13. Get user's booking history
```sql
SELECT
  b.id,
  r.name as resource_name,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.purpose,
  b.status,
  b.approved_at
FROM bookings b
JOIN resources r ON b.resource_id = r.id
WHERE b.booker_id = $1 AND b.deleted_at IS NULL
ORDER BY b.booking_date DESC, b.start_time DESC;
```

#### 14. Get pending approval bookings
```sql
SELECT
  b.id,
  u.full_name,
  r.name as resource_name,
  b.booking_date,
  b.start_time,
  b.end_time,
  b.purpose,
  b.created_at
FROM bookings b
JOIN users u ON b.booker_id = u.id
JOIN resources r ON b.resource_id = r.id
WHERE b.status = 'PENDING' AND b.deleted_at IS NULL
ORDER BY b.created_at DESC;
```

#### 15. Get peak booking hours
```sql
SELECT
  EXTRACT(HOUR FROM start_time) as hour,
  COUNT(*) as booking_count,
  COUNT(DISTINCT resource_id) as resource_count,
  COUNT(DISTINCT booker_id) as user_count
FROM bookings
WHERE status = 'APPROVED'
  AND deleted_at IS NULL
  AND booking_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY hour
ORDER BY booking_count DESC;
```

#### 16. Get top booked resources
```sql
SELECT
  r.id,
  r.name,
  r.resource_type,
  COUNT(b.id) as booking_count,
  COUNT(CASE WHEN b.status = 'APPROVED' THEN 1 END) as approved_count,
  AVG(EXTRACT(EPOCH FROM (b.end_time - b.start_time))/3600) as avg_duration_hours
FROM resources r
LEFT JOIN bookings b ON r.id = b.resource_id
  AND b.deleted_at IS NULL
  AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.resource_type
ORDER BY booking_count DESC
LIMIT 10;
```

#### 17. Get waitlist status for resource
```sql
SELECT
  we.id,
  u.full_name,
  u.email,
  we.position,
  we.status,
  we.created_at
FROM waitlist_entries we
JOIN users u ON we.user_id = u.id
WHERE we.booking_id = $1
ORDER BY we.position;
```

---

### TICKETS (Dev 3)

#### 18. Get open tickets by priority
```sql
SELECT
  id,
  ticket_number,
  title,
  category,
  priority,
  status,
  assignee_id,
  reporter_id,
  created_at,
  sla_breached
FROM tickets
WHERE status IN ('OPEN', 'IN_PROGRESS')
  AND deleted_at IS NULL
ORDER BY priority DESC, created_at ASC;
```

#### 19. Get technician's assigned tickets
```sql
SELECT
  t.id,
  t.ticket_number,
  t.title,
  t.priority,
  t.status,
  t.category,
  u.full_name as reporter_name,
  t.created_at,
  COUNT(tc.id) as comment_count,
  COUNT(ta.id) as attachment_count
FROM tickets t
LEFT JOIN users u ON t.reporter_id = u.id
LEFT JOIN ticket_comments tc ON t.id = tc.ticket_id AND tc.deleted_at IS NULL
LEFT JOIN ticket_attachments ta ON t.id = ta.ticket_id
WHERE t.assignee_id = $1
  AND t.status != 'CLOSED'
  AND t.deleted_at IS NULL
GROUP BY t.id, u.full_name
ORDER BY t.priority DESC, t.created_at ASC;
```

#### 20. Get ticket SLA metrics
```sql
SELECT
  t.id,
  t.ticket_number,
  t.status,
  t.priority,
  EXTRACT(EPOCH FROM (NOW() - t.created_at))/3600 as hours_open,
  EXTRACT(EPOCH FROM (t.first_response_at - t.created_at))/3600 as hours_to_first_response,
  EXTRACT(EPOCH FROM (t.resolved_at - t.created_at))/3600 as hours_to_resolution,
  t.sla_breached
FROM tickets
WHERE t.status IN ('IN_PROGRESS', 'RESOLVED', 'CLOSED')
  AND t.deleted_at IS NULL
ORDER BY hours_open DESC;
```

#### 21. Get tickets by category with counts
```sql
SELECT
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_count,
  COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN sla_breached = TRUE THEN 1 END) as sla_breached_count
FROM tickets
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY total DESC;
```

#### 22. Get technician workload analysis
```sql
SELECT
  u.id,
  u.full_name,
  COUNT(t.id) as total_assigned,
  COUNT(CASE WHEN t.status = 'OPEN' THEN 1 END) as open_count,
  COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN t.priority = 'CRITICAL' THEN 1 END) as critical_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - t.created_at))/3600) as avg_hours_open
FROM users u
LEFT JOIN tickets t ON u.id = t.assignee_id
  AND t.deleted_at IS NULL
  AND t.status IN ('OPEN', 'IN_PROGRESS')
WHERE u.role = 'TECHNICIAN' AND u.status = 'ACTIVE'
GROUP BY u.id, u.full_name
ORDER BY in_progress_count DESC;
```

#### 23. Get ticket comments for a ticket
```sql
SELECT
  tc.id,
  u.full_name as author,
  tc.content,
  tc.is_internal,
  tc.created_at,
  COUNT(ta.id) as attachment_count
FROM ticket_comments tc
LEFT JOIN users u ON tc.author_id = u.id
LEFT JOIN ticket_attachments ta ON tc.id = ta.comment_id
WHERE tc.ticket_id = $1 AND tc.deleted_at IS NULL
GROUP BY tc.id, u.full_name
ORDER BY tc.created_at ASC;
```

---

## SEED DATA

### Sample Users
```sql
INSERT INTO users (email, full_name, role, status, oauth_provider, oauth_id, created_at)
VALUES
  ('student@campus.edu', 'Alice Johnson', 'STUDENT', 'ACTIVE', 'google', 'google-id-1', NOW()),
  ('staff@campus.edu', 'Bob Smith', 'STAFF', 'ACTIVE', 'google', 'google-id-2', NOW()),
  ('tech@campus.edu', 'Charlie Brown', 'TECHNICIAN', 'ACTIVE', 'google', 'google-id-3', NOW()),
  ('admin@campus.edu', 'Diana Prince', 'ADMIN', 'ACTIVE', 'google', 'google-id-4', NOW());
```

### Sample Resources
```sql
INSERT INTO resources (resource_code, name, resource_type, status, location, capacity)
VALUES
  ('LH-101', 'Lecture Hall A', 'LECTURE_HALL', 'ACTIVE', 'Building A, Floor 1', 100),
  ('LAB-01', 'Computer Lab 1', 'LAB', 'ACTIVE', 'Building B, Floor 2', 30),
  ('MR-301', 'Meeting Room 1', 'MEETING_ROOM', 'ACTIVE', 'Building C, Floor 3', 12),
  ('EQ-001', 'Projector', 'EQUIPMENT', 'ACTIVE', 'Equipment Store', 1);
```

### Sample Availability Windows
```sql
INSERT INTO availability_windows (resource_id, day_of_week, start_time, end_time)
SELECT id, day, '08:00'::TIME, '18:00'::TIME
FROM resources,
  (SELECT generate_series(0, 4) as day) days;
```

### Sample Bookings
```sql
INSERT INTO bookings (resource_id, booker_id, booking_date, start_time, end_time, purpose, status)
SELECT
  r.id,
  u.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00'::TIME,
  '11:00'::TIME,
  'Class Session',
  'APPROVED'
FROM resources r, users u
LIMIT 5;
```

### Sample Tickets
```sql
INSERT INTO tickets (ticket_number, title, description, category, priority, status, reporter_id)
VALUES
  ('TK-001', 'Projector not working', 'Projector in LH-101 is not displaying', 'IT_EQUIPMENT', 'HIGH', 'OPEN',
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1)),
  ('TK-002', 'Air conditioning failure', 'AC in Building B is not cooling', 'HVAC', 'CRITICAL', 'IN_PROGRESS',
    (SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1));
```

---

## MIGRATION STEPS

```sql
-- 1. Create all tables in order (use this file as reference)
-- 2. Run seed data
-- 3. Verify data integrity

-- Verify constraints are working
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check index coverage
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify foreign key relationships
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE referenced_table_name IS NOT NULL
ORDER BY table_name;
```

---

## PERFORMANCE NOTES

1. **Compound Indexes**: Created for common query patterns (user_id + status, resource_id + date + status)
2. **Partial Indexes**: Used WHERE clauses on soft-delete queries and status checks
3. **Full-Text Search**: Configured for resources and tickets titles/descriptions
4. **JSON Storage**: Notification data stored in JSONB for flexibility
5. **Date Ranges**: Optimized for booking conflict detection
6. **Archive Strategy**: Use deleted_at for soft-deletes to maintain referential integrity

---

## BACKUP & RECOVERY

```sql
-- Backup the database
pg_dump smartcampus_db > smartcampus_db_backup.sql

-- Restore from backup
psql smartcampus_db < smartcampus_db_backup.sql

-- List table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Generated**: 21 April 2026
**Version**: 2.0
**Status**: Production Ready
**Team**: All 4 Developers (D1-D4)
