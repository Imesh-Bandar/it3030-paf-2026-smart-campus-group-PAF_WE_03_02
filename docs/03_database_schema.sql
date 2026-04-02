# Smart Campus Operations Hub — PostgreSQL Database Schema

> **Database:** PostgreSQL 14+  
> **Encoding:** UTF-8  
> **Timezone:** UTC  
> **Version:** 1.0  
> **Date:** March 2026

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Tables Definition](#tables-definition)
3. [Relationships Diagram](#relationships-diagram)
4. [Indexes](#indexes)
5. [Seed Data](#seed-data)
6. [Migration Script](#migration-script)

---

## Schema Overview

### Database Structure

- **Total Tables:** 11
- **Total Indexes:** 25
- **Total Foreign Keys:** 15
- **Enums:** 6

### Entity Categories

1. **User Management** — users, user_roles
2. **Facilities** — resources, resource_images
3. **Bookings** — bookings, booking_status_history
4. **Maintenance** — tickets, ticket_comments, ticket_evidence, ticket_status_history
5. **Notifications** — notifications

---

## Tables Definition

### 1. users

Stores all user accounts authenticated via Google OAuth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'TECHNICIAN')),
  CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'LOCKED', 'ARCHIVED'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

**Field Descriptions:**

- `id` — Unique user identifier (UUID)
- `email` — User email from Google OAuth (unique)
- `full_name` — Full name from Google profile
- `avatar_url` — Profile picture URL from Google
- `role` — User role: `USER`, `ADMIN`, `TECHNICIAN`
- `status` — Account status: `ACTIVE`, `LOCKED`, `ARCHIVED`
- `email_verified` — Whether email is verified (always true for Google OAuth)
- `google_id` — Google OAuth subject identifier (unique)
- `created_at` — Account creation timestamp
- `updated_at` — Last update timestamp
- `last_login_at` — Most recent login timestamp
- `deleted_at` — Soft delete timestamp (NULL if active)

---

### 2. refresh_tokens

Stores refresh tokens for JWT authentication.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT refresh_tokens_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at) WHERE revoked = FALSE;
```

**Field Descriptions:**

- `id` — Token record identifier
- `user_id` — Reference to user
- `token` — Hashed refresh token string (unique)
- `expires_at` — Token expiration timestamp (7 days from creation)
- `revoked` — Whether token has been revoked
- `created_at` — Token creation timestamp
- `revoked_at` — Token revocation timestamp (NULL if active)

---

### 3. resources

Stores all campus facilities and assets.

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  location TEXT NOT NULL,
  description TEXT,
  amenities TEXT[], -- PostgreSQL array type
  specifications JSONB, -- Free-form JSON for custom attributes
  thumbnail_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT resources_type_check CHECK (type IN ('LAB', 'CLASSROOM', 'HALL', 'EQUIPMENT', 'SPORTS_FACILITY')),
  CONSTRAINT resources_status_check CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE')),
  CONSTRAINT resources_capacity_check CHECK (capacity > 0 AND capacity <= 1000)
);

CREATE INDEX idx_resources_type ON resources(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_status ON resources(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_capacity ON resources(capacity) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_name ON resources USING GIN (to_tsvector('english', name));
CREATE INDEX idx_resources_description ON resources USING GIN (to_tsvector('english', description));
CREATE INDEX idx_resources_created_at ON resources(created_at);
```

**Field Descriptions:**

- `id` — Unique resource identifier
- `name` — Facility name (e.g., "Computer Lab 3A")
- `type` — Resource type enum
- `capacity` — Maximum occupancy (1-1000)
- `status` — Current availability status
- `location` — Physical location (building, floor, room)
- `description` — Detailed description
- `amenities` — Array of amenities (e.g., ["WiFi", "Projector"])
- `specifications` — JSONB object for flexible custom data
- `thumbnail_url` — Primary image URL
- `created_by` — User who created the resource
- `created_at` — Creation timestamp
- `updated_at` — Last update timestamp
- `deleted_at` — Soft delete timestamp

---

### 4. resource_images

Stores multiple images for each resource.

```sql
CREATE TABLE resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resource_images_resource_id ON resource_images(resource_id);
CREATE INDEX idx_resource_images_is_primary ON resource_images(resource_id, is_primary);
```

**Field Descriptions:**

- `id` — Image record identifier
- `resource_id` — Reference to resource
- `url` — Full image URL (CDN or local storage)
- `caption` — Image description
- `is_primary` — Whether this is the main image (only one per resource)
- `display_order` — Sort order for gallery display
- `created_at` — Upload timestamp

---

### 5. bookings

Stores all facility booking requests and confirmations.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  cancellation_reason TEXT,
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT bookings_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')),
  CONSTRAINT bookings_time_check CHECK (end_time > start_time),
  CONSTRAINT bookings_duration_check CHECK (
    EXTRACT(EPOCH FROM (end_time - start_time)) >= 1800 AND -- Min 30 minutes
    EXTRACT(EPOCH FROM (end_time - start_time)) <= 28800    -- Max 8 hours
  )
);

CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_end_time ON bookings(end_time);
CREATE INDEX idx_bookings_date_range ON bookings(resource_id, start_time, end_time);

-- Index for conflict detection (overlapping bookings)
CREATE INDEX idx_bookings_overlap ON bookings(resource_id, start_time, end_time) 
  WHERE status IN ('CONFIRMED', 'PENDING');
```

**Field Descriptions:**

- `id` — Unique booking identifier
- `resource_id` — Reference to booked resource
- `user_id` — User who requested the booking
- `start_time` — Booking start datetime (must be future)
- `end_time` — Booking end datetime
- `purpose` — Reason for booking
- `status` — Current status: `PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`, `COMPLETED`
- `cancellation_reason` — Why booking was cancelled (if applicable)
- `rejection_reason` — Why booking was rejected (if applicable)
- `approved_by` — Admin who approved (if CONFIRMED)
- `rejected_by` — Admin who rejected (if REJECTED)
- `cancelled_by` — User or admin who cancelled (if CANCELLED)
- `approved_at` — Approval timestamp
- `rejected_at` — Rejection timestamp
- `cancelled_at` — Cancellation timestamp
- `created_at` — Request submission timestamp
- `updated_at` — Last update timestamp

---

### 6. booking_status_history

Audit trail for booking status changes.

```sql
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT booking_status_history_old_status_check CHECK (
    old_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')
  ),
  CONSTRAINT booking_status_history_new_status_check CHECK (
    new_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')
  )
);

CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_created_at ON booking_status_history(created_at DESC);
```

**Field Descriptions:**

- `id` — History record identifier
- `booking_id` — Reference to booking
- `old_status` — Previous status (NULL on creation)
- `new_status` — New status
- `changed_by` — User who made the change
- `notes` — Optional explanation for status change
- `created_at` — Timestamp of status change

---

### 7. tickets

Stores maintenance and incident reports.

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT tickets_severity_check CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT tickets_category_check CHECK (category IN ('ELECTRICAL', 'PLUMBING', 'EQUIPMENT', 'CLEANING', 'OTHER')),
  CONSTRAINT tickets_status_check CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
);

CREATE INDEX idx_tickets_resource_id ON tickets(resource_id);
CREATE INDEX idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_severity ON tickets(severity);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
```

**Field Descriptions:**

- `id` — Unique ticket identifier
- `ticket_number` — Human-readable ticket number (e.g., TICK-20260327-0012)
- `resource_id` — Facility where issue occurred
- `reporter_id` — User who reported the issue
- `assigned_to` — Technician assigned to resolve (if any)
- `title` — Brief issue summary
- `description` — Detailed description
- `severity` — Issue priority: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `category` — Issue type
- `status` — Current status: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- `assigned_by` — Admin who assigned the technician
- `assigned_at` — Assignment timestamp
- `resolved_at` — Resolution timestamp
- `created_at` — Report timestamp
- `updated_at` — Last update timestamp

---

### 8. ticket_evidence

Stores photo evidence for tickets.

```sql
CREATE TABLE ticket_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_evidence_ticket_id ON ticket_evidence(ticket_id);
```

**Field Descriptions:**

- `id` — Evidence record identifier
- `ticket_id` — Reference to ticket
- `url` — Image URL
- `uploaded_by` — User who uploaded the image
- `uploaded_at` — Upload timestamp

---

### 9. ticket_comments

Stores comment threads on tickets.

```sql
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at ASC);
```

**Field Descriptions:**

- `id` — Comment identifier
- `ticket_id` — Reference to ticket
- `user_id` — User who posted the comment
- `text` — Comment content
- `created_at` — Comment timestamp

---

### 10. ticket_status_history

Audit trail for ticket status changes.

```sql
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ticket_status_history_old_status_check CHECK (
    old_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')
  ),
  CONSTRAINT ticket_status_history_new_status_check CHECK (
    new_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')
  )
);

CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_created_at ON ticket_status_history(created_at DESC);
```

**Field Descriptions:**

- `id` — History record identifier
- `ticket_id` — Reference to ticket
- `old_status` — Previous status (NULL on creation)
- `new_status` — New status
- `changed_by` — User who changed the status
- `notes` — Status change explanation
- `created_at` — Timestamp of status change

---

### 11. notifications

Stores user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT notifications_type_check CHECK (type IN ('BOOKING', 'TICKET', 'SYSTEM')),
  CONSTRAINT notifications_entity_type_check CHECK (entity_type IN ('BOOKING', 'TICKET', 'RESOURCE', NULL))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
```

**Field Descriptions:**

- `id` — Notification identifier
- `user_id` — Recipient user
- `type` — Notification category: `BOOKING`, `TICKET`, `SYSTEM`
- `title` — Notification title
- `message` — Notification body
- `entity_type` — Related entity type (for deep linking)
- `entity_id` — Related entity ID
- `is_read` — Whether user has read the notification
- `read_at` — Timestamp when marked as read
- `created_at` — Notification creation timestamp

---

## Relationships Diagram

```
users (1) ──────────────< (N) bookings
users (1) ──────────────< (N) tickets (as reporter)
users (1) ──────────────< (N) tickets (as assigned_to)
users (1) ──────────────< (N) refresh_tokens
users (1) ──────────────< (N) notifications

resources (1) ──────────< (N) bookings
resources (1) ──────────< (N) tickets
resources (1) ──────────< (N) resource_images

bookings (1) ───────────< (N) booking_status_history

tickets (1) ────────────< (N) ticket_evidence
tickets (1) ────────────< (N) ticket_comments
tickets (1) ────────────< (N) ticket_status_history
```

**Cardinality:**
- A user can have many bookings, tickets, notifications, and refresh tokens
- A resource can have many bookings, tickets, and images
- A booking/ticket can have many status history entries
- A ticket can have many evidence photos and comments

---

## Indexes

### Performance Optimization Strategy

1. **Foreign Key Indexes** — All FK columns are indexed for join performance
2. **Query Filter Indexes** — Columns used in WHERE clauses (status, type, date ranges)
3. **Full-Text Search** — GIN indexes on `name` and `description` for text search
4. **Composite Indexes** — Multi-column indexes for common query patterns
5. **Partial Indexes** — Filtered indexes for frequently queried subsets (e.g., WHERE deleted_at IS NULL)

### Index Summary

| Table | Index Count | Special Indexes |
|-------|-------------|-----------------|
| users | 4 | Partial index on status |
| refresh_tokens | 3 | Partial index on unexpired tokens |
| resources | 6 | GIN full-text search indexes |
| resource_images | 2 | |
| bookings | 7 | Overlap detection composite index |
| booking_status_history | 2 | |
| tickets | 8 | |
| ticket_evidence | 1 | |
| ticket_comments | 2 | |
| ticket_status_history | 2 | |
| notifications | 4 | Composite index on user_id + is_read |

**Total:** 41 indexes

---

## Seed Data

### Default Admin User

```sql
INSERT INTO users (id, email, full_name, role, status, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@smartcampus.edu',
  'System Administrator',
  'ADMIN',
  'ACTIVE',
  TRUE,
  NOW()
);
```

### Sample Technician

```sql
INSERT INTO users (id, email, full_name, role, status, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'technician@smartcampus.edu',
  'Mike Wilson',
  'TECHNICIAN',
  'ACTIVE',
  TRUE,
  NOW()
);
```

### Sample Resources

```sql
-- Computer Lab
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Computer Lab 3A',
  'LAB',
  40,
  'AVAILABLE',
  'IT Building - Floor 3, Room 3A',
  'Advanced computer lab with 40 workstations, high-performance PCs, dual monitors',
  ARRAY['WiFi', 'Projector', 'Air Conditioning', 'Whiteboard', 'Smart Board'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- Lecture Hall
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Main Lecture Hall',
  'HALL',
  200,
  'AVAILABLE',
  'Main Building - Ground Floor',
  'Large lecture hall with theater seating, stage, and presentation equipment',
  ARRAY['WiFi', 'Projector', 'Microphone System', 'Air Conditioning', 'Wheelchair Access'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- Classroom
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Classroom 2B',
  'CLASSROOM',
  30,
  'AVAILABLE',
  'Academic Building - Floor 2, Room 2B',
  'Standard classroom with desks and chairs',
  ARRAY['WiFi', 'Whiteboard', 'Air Conditioning'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- Sports Facility
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Indoor Sports Hall',
  'SPORTS_FACILITY',
  100,
  'AVAILABLE',
  'Sports Complex - Ground Floor',
  'Multi-purpose indoor sports hall for basketball, volleyball, badminton',
  ARRAY['Changing Rooms', 'Storage', 'First Aid Kit', 'Water Fountain'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- Equipment
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Projector Cart (Mobile)',
  'EQUIPMENT',
  1,
  'AVAILABLE',
  'IT Office - Equipment Storage',
  'Mobile projector cart with laptop and speakers for flexible use',
  ARRAY['Projector', 'Laptop', 'Speakers', 'HDMI Cable', 'Extension Cord'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);
```

---

## Migration Script

### Complete Schema Creation

Save this as `01_schema.sql`:

```sql
-- ============================================================
-- Smart Campus Operations Hub - Database Schema
-- PostgreSQL 14+
-- Version: 1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP TABLES (for clean re-run)
-- ============================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_status_history CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_evidence CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS booking_status_history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS resource_images CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- CREATE TABLES
-- ============================================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'TECHNICIAN')),
  CONSTRAINT users_status_check CHECK (status IN ('ACTIVE', 'LOCKED', 'ARCHIVED'))
);

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Resources (Facilities) Table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  location TEXT NOT NULL,
  description TEXT,
  amenities TEXT[],
  specifications JSONB,
  thumbnail_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT resources_type_check CHECK (type IN ('LAB', 'CLASSROOM', 'HALL', 'EQUIPMENT', 'SPORTS_FACILITY')),
  CONSTRAINT resources_status_check CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE')),
  CONSTRAINT resources_capacity_check CHECK (capacity > 0 AND capacity <= 1000)
);

-- Resource Images Table
CREATE TABLE resource_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  cancellation_reason TEXT,
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT bookings_status_check CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')),
  CONSTRAINT bookings_time_check CHECK (end_time > start_time),
  CONSTRAINT bookings_duration_check CHECK (
    EXTRACT(EPOCH FROM (end_time - start_time)) >= 1800 AND
    EXTRACT(EPOCH FROM (end_time - start_time)) <= 28800
  )
);

-- Booking Status History Table
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT booking_status_history_old_status_check CHECK (
    old_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')
  ),
  CONSTRAINT booking_status_history_new_status_check CHECK (
    new_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED')
  )
);

-- Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT tickets_severity_check CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT tickets_category_check CHECK (category IN ('ELECTRICAL', 'PLUMBING', 'EQUIPMENT', 'CLEANING', 'OTHER')),
  CONSTRAINT tickets_status_check CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
);

-- Ticket Evidence Table
CREATE TABLE ticket_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ticket Comments Table
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ticket Status History Table
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT ticket_status_history_old_status_check CHECK (
    old_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')
  ),
  CONSTRAINT ticket_status_history_new_status_check CHECK (
    new_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')
  )
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT notifications_type_check CHECK (type IN ('BOOKING', 'TICKET', 'SYSTEM')),
  CONSTRAINT notifications_entity_type_check CHECK (entity_type IN ('BOOKING', 'TICKET', 'RESOURCE', NULL))
);

-- ============================================================
-- CREATE INDEXES
-- ============================================================

-- Users Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- Refresh Tokens Indexes
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at) WHERE revoked = FALSE;

-- Resources Indexes
CREATE INDEX idx_resources_type ON resources(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_status ON resources(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_capacity ON resources(capacity) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_name ON resources USING GIN (to_tsvector('english', name));
CREATE INDEX idx_resources_description ON resources USING GIN (to_tsvector('english', description));
CREATE INDEX idx_resources_created_at ON resources(created_at);

-- Resource Images Indexes
CREATE INDEX idx_resource_images_resource_id ON resource_images(resource_id);
CREATE INDEX idx_resource_images_is_primary ON resource_images(resource_id, is_primary);

-- Bookings Indexes
CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_end_time ON bookings(end_time);
CREATE INDEX idx_bookings_date_range ON bookings(resource_id, start_time, end_time);
CREATE INDEX idx_bookings_overlap ON bookings(resource_id, start_time, end_time) 
  WHERE status IN ('CONFIRMED', 'PENDING');

-- Booking Status History Indexes
CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_created_at ON booking_status_history(created_at DESC);

-- Tickets Indexes
CREATE INDEX idx_tickets_resource_id ON tickets(resource_id);
CREATE INDEX idx_tickets_reporter_id ON tickets(reporter_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_severity ON tickets(severity);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Ticket Evidence Indexes
CREATE INDEX idx_ticket_evidence_ticket_id ON ticket_evidence(ticket_id);

-- Ticket Comments Indexes
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at ASC);

-- Ticket Status History Indexes
CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_created_at ON ticket_status_history(created_at DESC);

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin User
INSERT INTO users (id, email, full_name, role, status, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@smartcampus.edu',
  'System Administrator',
  'ADMIN',
  'ACTIVE',
  TRUE,
  NOW()
);

-- Default Technician
INSERT INTO users (id, email, full_name, role, status, email_verified, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'technician@smartcampus.edu',
  'Mike Wilson',
  'TECHNICIAN',
  'ACTIVE',
  TRUE,
  NOW()
);

-- Sample Resources
INSERT INTO resources (id, name, type, capacity, status, location, description, amenities, created_by, created_at)
VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Computer Lab 3A',
  'LAB',
  40,
  'AVAILABLE',
  'IT Building - Floor 3, Room 3A',
  'Advanced computer lab with 40 workstations, high-performance PCs, dual monitors',
  ARRAY['WiFi', 'Projector', 'Air Conditioning', 'Whiteboard', 'Smart Board'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Main Lecture Hall',
  'HALL',
  200,
  'AVAILABLE',
  'Main Building - Ground Floor',
  'Large lecture hall with theater seating, stage, and presentation equipment',
  ARRAY['WiFi', 'Projector', 'Microphone System', 'Air Conditioning', 'Wheelchair Access'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  'Classroom 2B',
  'CLASSROOM',
  30,
  'AVAILABLE',
  'Academic Building - Floor 2, Room 2B',
  'Standard classroom with desks and chairs',
  ARRAY['WiFi', 'Whiteboard', 'Air Conditioning'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
),
(
  '44444444-4444-4444-4444-444444444444',
  'Indoor Sports Hall',
  'SPORTS_FACILITY',
  100,
  'AVAILABLE',
  'Sports Complex - Ground Floor',
  'Multi-purpose indoor sports hall for basketball, volleyball, badminton',
  ARRAY['Changing Rooms', 'Storage', 'First Aid Kit', 'Water Fountain'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
),
(
  '55555555-5555-5555-5555-555555555555',
  'Projector Cart (Mobile)',
  'EQUIPMENT',
  1,
  'AVAILABLE',
  'IT Office - Equipment Storage',
  'Mobile projector cart with laptop and speakers for flexible use',
  ARRAY['Projector', 'Laptop', 'Speakers', 'HDMI Cable', 'Extension Cord'],
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Count tables
SELECT 
  schemaname,
  COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

-- List all tables with row counts
SELECT 
  relname as table_name,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;

-- Verify seed data
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Resources', COUNT(*) FROM resources
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
```

### Running the Migration

```bash
# Using psql command line
psql postgresql://user:pass@host:5432/smartcampus -f 01_schema.sql

# Or using environment variable
export DATABASE_URL="postgresql://user:pass@host:5432/smartcampus"
psql $DATABASE_URL -f 01_schema.sql
```

---

**End of Database Schema Documentation**
