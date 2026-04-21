# Smart Campus Database Schema - MySQL Version
**Database**: MySQL 8.0+
**Last Updated**: 21 April 2026
**Status**: Ready for Implementation

---

## Quick Setup for MySQL

### 1. Create Database
```sql
CREATE DATABASE smart_campus_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE smart_campus_db;
```

### 2. Enable UUID Support (MySQL 8.0+)
```sql
-- MySQL 8.0 has UUID() function built-in
-- Verify with:
SELECT UUID();
```

---

## Complete MySQL Schema

### MODULE D4: AUTHENTICATION & USERS (Dev 4)

#### Table: users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  avatar_url LONGTEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  oauth_provider VARCHAR(50),
  oauth_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT check_role CHECK (role IN ('STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN')),
  CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_oauth_id (oauth_id),
  INDEX idx_status_deleted (status, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token LONGTEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_user_id (user_id),
  INDEX idx_expires_revoked (expires_at, revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: security_activity_logs
```sql
CREATE TABLE security_activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50),
  user_agent LONGTEXT,
  location VARCHAR(255),
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_security_logs_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT check_event_type CHECK (event_type IN (
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'TOKEN_REFRESH'
  )),

  INDEX idx_user_id (user_id),
  INDEX idx_is_suspicious (is_suspicious),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_user_suspicious (user_id, is_suspicious)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: notifications
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message LONGTEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  data JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT check_notification_type CHECK (notification_type IN (
    'BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED',
    'TICKET_ASSIGNED', 'TICKET_UPDATED', 'TICKET_RESOLVED',
    'SECURITY_ALERT', 'REMINDER', 'GENERAL'
  )),

  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: notification_preferences
```sql
CREATE TABLE notification_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  booking_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ticket_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  security_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  general_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_preferences_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### MODULE D1: FACILITIES & RESOURCES

#### Table: resources
```sql
CREATE TABLE resources (
  id VARCHAR(36) PRIMARY KEY,
  resource_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  resource_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  location VARCHAR(255),
  capacity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT check_type CHECK (resource_type IN (
    'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT', 'FACILITY'
  )),
  CONSTRAINT check_res_status CHECK (status IN (
    'ACTIVE', 'OUT_OF_SERVICE', 'UNDER_MAINTENANCE'
  )),
  CONSTRAINT check_capacity CHECK (capacity > 0),

  INDEX idx_type (resource_type),
  INDEX idx_status_deleted (status, deleted_at),
  INDEX idx_location (location),
  INDEX idx_code (resource_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: availability_windows
```sql
CREATE TABLE availability_windows (
  id VARCHAR(36) PRIMARY KEY,
  resource_id VARCHAR(36) NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_availability_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT check_day CHECK (day_of_week >= 0 AND day_of_week <= 6),

  INDEX idx_resource_id (resource_id),
  INDEX idx_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: maintenance_blackouts
```sql
CREATE TABLE maintenance_blackouts (
  id VARCHAR(36) PRIMARY KEY,
  resource_id VARCHAR(36) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason VARCHAR(255),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_blackout_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_blackout_created_by FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_resource_id (resource_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_active (resource_id, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: resource_images
```sql
CREATE TABLE resource_images (
  id VARCHAR(36) PRIMARY KEY,
  resource_id VARCHAR(36) NOT NULL,
  image_url LONGTEXT NOT NULL,
  image_path VARCHAR(500),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_images_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_resource_id (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### MODULE D2: BOOKINGS

#### Table: bookings
```sql
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  resource_id VARCHAR(36) NOT NULL,
  booker_id VARCHAR(36) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  rejected_reason VARCHAR(500),
  qr_token VARCHAR(255) UNIQUE,
  checked_in_at TIMESTAMP NULL,
  checked_in_by VARCHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT fk_booking_resource FOREIGN KEY (resource_id)
    REFERENCES resources(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_booking_booker FOREIGN KEY (booker_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_booking_approved_by FOREIGN KEY (approved_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_booking_checked_in_by FOREIGN KEY (checked_in_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT check_booking_status CHECK (status IN (
    'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'
  )),

  INDEX idx_resource_id (resource_id),
  INDEX idx_booker_id (booker_id),
  INDEX idx_status (status),
  INDEX idx_approved_by (approved_by),
  INDEX idx_booking_date (booking_date),
  INDEX idx_resource_date_status (resource_id, booking_date, status),
  UNIQUE INDEX idx_no_overlap (resource_id, booking_date, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: booking_status_history
```sql
CREATE TABLE booking_status_history (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(36) NOT NULL,
  reason VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_status_history_booking FOREIGN KEY (booking_id)
    REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_status_history_changed_by FOREIGN KEY (changed_by)
    REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_booking_id (booking_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: waitlist_entries
```sql
CREATE TABLE waitlist_entries (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  position INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
  promoted_to_booking_id VARCHAR(36),
  promoted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_waitlist_booking FOREIGN KEY (booking_id)
    REFERENCES bookings(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_waitlist_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_waitlist_promoted FOREIGN KEY (promoted_to_booking_id)
    REFERENCES bookings(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT check_waitlist_status CHECK (status IN (
    'WAITING', 'OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED'
  )),

  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### MODULE D3: TICKETS & MAINTENANCE

#### Table: tickets
```sql
CREATE TABLE tickets (
  id VARCHAR(36) PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  reporter_id VARCHAR(36),
  assignee_id VARCHAR(36),
  location VARCHAR(255),
  first_response_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT fk_ticket_reporter FOREIGN KEY (reporter_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_ticket_assignee FOREIGN KEY (assignee_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT check_ticket_category CHECK (category IN (
    'ELECTRICAL', 'PLUMBING', 'IT_EQUIPMENT', 'HVAC', 'STRUCTURAL', 'OTHER'
  )),
  CONSTRAINT check_ticket_priority CHECK (priority IN (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  )),
  CONSTRAINT check_ticket_status CHECK (status IN (
    'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'
  )),

  INDEX idx_reporter_id (reporter_id),
  INDEX idx_assignee_id (assignee_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_category (category),
  INDEX idx_assignee_status (assignee_id, status),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_sla_breached (sla_breached)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: ticket_comments
```sql
CREATE TABLE ticket_comments (
  id VARCHAR(36) PRIMARY KEY,
  ticket_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36),
  content LONGTEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT fk_comment_ticket FOREIGN KEY (ticket_id)
    REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comment_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_ticket_id (ticket_id),
  INDEX idx_author_id (author_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: ticket_attachments
```sql
CREATE TABLE ticket_attachments (
  id VARCHAR(36) PRIMARY KEY,
  ticket_id VARCHAR(36) NOT NULL,
  comment_id VARCHAR(36),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_attachment_ticket FOREIGN KEY (ticket_id)
    REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_attachment_comment FOREIGN KEY (comment_id)
    REFERENCES ticket_comments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_attachment_uploaded_by FOREIGN KEY (uploaded_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_ticket_id (ticket_id),
  INDEX idx_comment_id (comment_id),
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Table: ticket_status_history
```sql
CREATE TABLE ticket_status_history (
  id VARCHAR(36) PRIMARY KEY,
  ticket_id VARCHAR(36) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(36),
  reason VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ticket_status_history FOREIGN KEY (ticket_id)
    REFERENCES tickets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ticket_status_changed_by FOREIGN KEY (changed_by)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_ticket_id (ticket_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Import Instructions for Spring Boot

### 1. Update `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_campus_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: validate  # Use 'validate' after tables created
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        jdbc:
          batch_size: 20
          fetch_size: 50
        order_inserts: true
        order_updates: true

logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### 2. Add MySQL Dependency to `pom.xml`
```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.33</version>
</dependency>
```

### 3. Create Schema Import File
Place the MySQL schema above in: `src/main/resources/db/migration/V1__Initial_Schema.sql`

Or use Flyway to auto-run:
```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-mysql</artifactId>
</dependency>
```

---

## Sample Data for Testing

```sql
-- Create test user
INSERT INTO users (id, email, full_name, role, status, created_at)
VALUES (UUID(), 'test@campus.edu', 'Test User', 'ADMIN', 'ACTIVE', NOW());

-- Get UUID for next queries
SET @user_id = (SELECT id FROM users WHERE email = 'test@campus.edu' LIMIT 1);

-- Create test resource
INSERT INTO resources (id, resource_code, name, resource_type, status, location, capacity)
VALUES (UUID(), 'LH-101', 'Lecture Hall A', 'LECTURE_HALL', 'ACTIVE', 'Building A', 100);

SET @resource_id = (SELECT id FROM resources WHERE resource_code = 'LH-101' LIMIT 1);

-- Create test booking
INSERT INTO bookings (id, resource_id, booker_id, booking_date, start_time, end_time, purpose, status)
VALUES (UUID(), @resource_id, @user_id, CURDATE() + INTERVAL 1 DAY, '10:00:00', '11:00:00', 'Class', 'APPROVED');
```

---

## Useful MySQL Queries

### Check Table Sizes
```sql
SELECT
  TABLE_NAME,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'smart_campus_db'
ORDER BY (data_length + index_length) DESC;
```

### View All Indexes
```sql
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'smart_campus_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

### Check Foreign Key Constraints
```sql
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_campus_db'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## Performance Tuning Notes

1. **Auto-increment for IDs**: Using VARCHAR(36) for UUIDs is intentional for consistency
2. **Indexes on Foreign Keys**: Already included for join performance
3. **Covering Indexes**: Use composite indexes for common WHERE+ORDER BY patterns
4. **Buffer Pool**: Set `innodb_buffer_pool_size` to 50-75% of system RAM
5. **Max Connections**: Set `max_connections` appropriately for your environment

---

**Generated**: 21 April 2026
**Database**: MySQL 8.0+
**Status**: Ready for Production
