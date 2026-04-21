# 📚 Database Documentation - Complete Guide
**Smart Campus Operations Hub**  
**All Developers Reference**  
**Updated**: 21 April 2026

---

## 🗂️ Documentation Files Overview

### For **SETUP** (Database Admin - Do First!)
📄 **[DATABASE_SCHEMA_MYSQL.sql](DATABASE_SCHEMA_MYSQL.sql)** ← **START HERE**
- Complete MySQL 8.0+ schema with 16 tables
- Ready to import: `mysql < DATABASE_SCHEMA_MYSQL.sql`
- Includes sample data
- Spring Boot configuration examples
- Flyway migration setup

✓ Why MySQL? Spring Boot + MySQL is standard, easier setup than PostgreSQL

---

### For **YOUR IMPLEMENTATION** (Dev 1-4)
📄 **[DATABASE_IMPLEMENTATION_GUIDE.md](DATABASE_IMPLEMENTATION_GUIDE.md)** ← **READ THIS**
- Step-by-step what you need to build
- Per-module implementation checklist
- Integration flow between modules
- Critical constraints explained
- Common pitfalls + solutions
- Timeline to submission

---

### For **QUICK REFERENCE** (During Coding)
📄 **[DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md)** ← **BOOKMARK THIS**
- One-page per module
- API endpoints you must implement
- Key table fields
- Indexes needed
- ER diagram
- Security rules

---

### For **ADVANCED REFERENCE** (If You Need Deep Details)
📄 **[COMPLETE_DATABASE_SCHEMA.sql](COMPLETE_DATABASE_SCHEMA.sql)**
- PostgreSQL version (for learning)
- 23+ useful queries with explanations
- Advanced index strategies
- SLA calculations
- Migration workflow

---

## 👥 WHO READS WHAT?

### 👨‍💻 Dev 1 - Facilities & Resources
```
MUST READ (in order):
1. DATABASE_IMPLEMENTATION_GUIDE.md → Find "Dev 1: FACILITIES & RESOURCES"
2. DATABASE_QUICK_REFERENCE.md → Find "MODULE D1"
3. DATABASE_SCHEMA_MYSQL.sql → See tables: resources, availability_windows, 
                                maintenance_blackouts, resource_images

YOUR TABLES: 4
├─ resources
├─ availability_windows
├─ maintenance_blackouts
└─ resource_images

DEPENDS ON: Nothing (foundational)
NEEDED BY: Dev 2 (bookings)
ENDPOINTS: 6+
CHALLENGE: Validate availability windows don't conflict
```

---

### 👨‍💻 Dev 2 - Bookings  
```
MUST READ (in order):
1. DATABASE_IMPLEMENTATION_GUIDE.md → Find "Dev 2: BOOKINGS"
2. DATABASE_QUICK_REFERENCE.md → Find "MODULE D2"
3. DATABASE_SCHEMA_MYSQL.sql → See tables: bookings, booking_status_history,
                                waitlist_entries

YOUR TABLES: 3
├─ bookings (with UNIQUE index to prevent overlaps!)
├─ booking_status_history
└─ waitlist_entries

DEPENDS ON: Dev 1 (resources), Dev 4 (users)
CRITICAL: Test overlapping booking detection!
ENDPOINTS: 7+
CHALLENGE: Implement the UNIQUE index constraint correctly
```

---

### 👨‍💻 Dev 3 - Tickets & Maintenance
```
MUST READ (in order):
1. DATABASE_IMPLEMENTATION_GUIDE.md → Find "Dev 3: TICKETS & MAINTENANCE"
2. DATABASE_QUICK_REFERENCE.md → Find "MODULE D3"
3. DATABASE_SCHEMA_MYSQL.sql → See tables: tickets, ticket_comments,
                                ticket_attachments, ticket_status_history

YOUR TABLES: 4
├─ tickets
├─ ticket_comments
├─ ticket_attachments
└─ ticket_status_history

DEPENDS ON: Dev 4 (users)
CHALLENGE: Multipart file uploads + internal vs public comments
ENDPOINTS: 8+
SLA CALCULATION: CRITICAL, HIGH, MEDIUM, LOW with different thresholds
```

---

### ✅ Dev 4 - Auth & Notifications  
```
STATUS: COMPLETE ✓
TABLES: 5 (all created and tested)
├─ users
├─ refresh_tokens
├─ security_activity_logs
├─ notifications
└─ notification_preferences

ENDPOINTS: 13 (all implemented)
WHAT TO DO: 
- Continue maintaining
- Help other devs when they integrate
- Test integration with their modules
- Monitor for security issues
```

---

## 🚀 QUICK START WORKFLOW

### Step 1: Setup (5 minutes)
```bash
# Copy DATABASE_SCHEMA_MYSQL.sql to your machine
# Create database
mysql -u root -p -e "CREATE DATABASE smart_campus_db;"

# Import schema
mysql -u root -p smart_campus_db < DATABASE_SCHEMA_MYSQL.sql

# Verify
mysql -u root -p smart_campus_db -e "SHOW TABLES;"
# Should see: 16 tables listed
```

### Step 2: Dev 1-2 Start
```bash
# Read DATABASE_IMPLEMENTATION_GUIDE.md
# Section: "Dev 1: FACILITIES & RESOURCES"

# Look at DATABASE_SCHEMA_MYSQL.sql
# Find CREATE TABLE statements for your tables
# Copy into JPA @Entity classes

# Run tests to verify tables exist
mvn test
```

### Step 3: Dev 3 Starts After Dev 1
```bash
# Dev 1 must finish resources tables first
# Then Dev 3 can create tickets tables
# (No direct dependency, but good workflow)
```

### Step 4: Integration Testing (Days 5-6)
```bash
# All devs test together
# Call each other's APIs
# Fix any issues
# Submit together
```

---

## 📊 TABLES AT A GLANCE

| # | Table | Dev | Rows | Purpose | Status |
|---|-------|-----|------|---------|--------|
| 1 | users | D4 | ? | User accounts | ✅ |
| 2 | refresh_tokens | D4 | ? | JWT tokens | ✅ |
| 3 | security_activity_logs | D4 | ? | Login audit | ✅ |
| 4 | notifications | D4 | ? | User alerts | ✅ |
| 5 | notification_preferences | D4 | ? | Alert settings | ✅ |
| 6 | resources | D1 | ~20 | Facilities | ⏳ |
| 7 | availability_windows | D1 | ~140 | Open hours | ⏳ |
| 8 | maintenance_blackouts | D1 | ~5 | Maintenance | ⏳ |
| 9 | resource_images | D1 | ~50 | Photos | ⏳ |
| 10 | bookings | D2 | ~100 | Reservations | ⏳ |
| 11 | booking_status_history | D2 | ~200 | Approval log | ⏳ |
| 12 | waitlist_entries | D2 | ~20 | Queue | ⏳ |
| 13 | tickets | D3 | ~30 | Issues | ⏳ |
| 14 | ticket_comments | D3 | ~100 | Discussion | ⏳ |
| 15 | ticket_attachments | D3 | ~50 | Files | ⏳ |
| 16 | ticket_status_history | D3 | ~60 | Workflow | ⏳ |

---

## ✨ KEY FEATURES EXPLAINED

### 🔐 Role-Based Access
```
STUDENT    → Browse resources, make bookings, report tickets
STAFF      → + Approve own bookings  
TECHNICIAN → + Assigned tickets, update status
ADMIN      → Full access to everything
```

### 📋 Soft Delete Strategy
```
Instead of: DELETE FROM table WHERE id = ?
Use: UPDATE table SET deleted_at = NOW() WHERE id = ?

Benefit: Can recover deleted data, maintain audit trail
```

### 🔔 Notification System
```
Triggered on:
- Booking approved/rejected/cancelled
- Ticket assigned/updated/resolved
- Security alert (suspicious login)
- Reminder notifications
- General announcements

User can disable by category in notification_preferences
```

### 📅 Booking Conflict Detection
```
MySQL UNIQUE INDEX prevents overlapping bookings:
  UNIQUE (resource_id, booking_date, start_time, end_time)
  
If overlapping times → MySQL ERROR 1062
App catches error → Returns 409 Conflict to frontend
User sees: "Sorry, this time slot is taken"
```

### 🎫 SLA Tracking for Tickets
```
Priority → SLA Threshold
CRITICAL → 4 hours
HIGH     → 8 hours  
MEDIUM   → 24 hours
LOW      → 48 hours

If resolved_at - created_at > threshold → sla_breached = TRUE
Dashboard shows SLA breaches for management review
```

---

## 🔗 RELATIONSHIPS CHEAT SHEET

```
users ──1──────────M── notifications
 │ └─────────────────────────┘ (many notifications per user)
 │
 ├─1──────────M── bookings (as booker_id)
 │ └─────────────────────────┘ (user makes many bookings)
 │
 ├─1──────────M── tickets (as reporter_id or assignee_id)  
 │ └─────────────────────────┘ (user reports/assigned tickets)
 │
 └─1──────────M── security_activity_logs
   └─────────────────────────┘ (track user logins)

resources ──1──────────M── bookings
  │ └──────────────────────────────┘ (many bookings per resource)
  │
  └─1──────────M── maintenance_blackouts
    └──────────────────────────────┘ (schedule maintenance periods)

bookings ──1──────────M── waitlist_entries
  └───────────────────────────────┘ (queue for full bookings)

tickets ──1──────────M── ticket_comments
  │ └──────────────────────────┘ (discussion thread)
  │
  └─1──────────M── ticket_status_history
    └──────────────────────────┘ (workflow audit trail)

ticket_comments ──1──────────M── ticket_attachments
  └────────────────────────────────┘ (evidence files per comment)
```

---

## 📱 EXAMPLE: Create Booking Flow

```
1. FRONTEND
   POST /api/v1/bookings
   {
     "resourceId": "uuid-1",
     "bookingDate": "2026-04-25",
     "startTime": "10:00",
     "endTime": "11:00",
     "purpose": "Class discussion"
   }

2. DEV 4: AuthController
   Verify JWT token ✓
   Check user role ✓
   
3. DEV 2: BookingController
   Receive POST request
   
4. DEV 2: BookingService
   - checkAvailability() → Ask Dev 1
   - detectConflict() → Query database
     SELECT * FROM bookings 
     WHERE resource_id = 'uuid-1'
     AND booking_date = '2026-04-25'
     AND status IN ('PENDING', 'APPROVED')
   
   If overlap found → Throw ConflictException
   If available → Proceed
   
5. DEV 2: BookingRepository
   INSERT INTO bookings
   VALUES ('new-uuid', 'uuid-1', 'user-1', ...)
   
   MySQL checks UNIQUE constraint
   If OK → Row inserted ✓
   If conflict → Error 1062 (duplicate key)
   
6. DEV 4: NotificationService
   Create notification:
   INSERT INTO notifications
   VALUES (new-uuid, user_id, 'BOOKING_CREATED', ...)
   
7. FRONTEND
   Polls /api/v1/notifications
   Receives new notification
   Updates UI with success message

Done! ✓
```

---

## ⚡ PERFORMANCE TIPS

### ✅ DO THIS
```sql
-- Filter by indexed columns first
SELECT * FROM bookings 
WHERE resource_id = ? AND booking_date = ? AND status = ?

-- Use composite index (resource_id, booking_date, status)
-- Query completes in <10ms
```

### ❌ DON'T DO THIS
```sql
-- SELECT without WHERE clause
SELECT * FROM bookings

-- SELECT with OR conditions (harder to optimize)
SELECT * FROM bookings WHERE resource_id = ? OR booker_id = ?

-- SELECT with calculations in WHERE
SELECT * FROM bookings WHERE YEAR(booking_date) = 2026
```

---

## 🐛 DEBUGGING CHECKLIST

Having issues? Check these first:

```
❓ "Table doesn't exist"
→ Did you run DATABASE_SCHEMA_MYSQL.sql?
→ Check: mysql> SHOW TABLES;

❓ "Connection refused"
→ Is MySQL running? ps aux | grep mysql
→ Check connection string in application.yml

❓ "Unique constraint violated"
→ Trying to insert overlapping booking?
→ Check: SELECT * FROM bookings WHERE resource_id=?

❓ "Foreign key constraint fails"
→ Parent table row missing?
→ Check: Does user exist? Does resource exist?

❓ "Query too slow (>1s)"
→ Missing index?
→ Check: EXPLAIN SELECT * FROM ...
→ Add index if no index scan used

❓ "NullPointerException"
→ Data not found?
→ Use Optional<T> properly:
   repository.findById(id).orElseThrow(...)
```

---

## 📞 WHEN TO ASK FOR HELP

### Ask Dev 4 (Auth)
- "How do I check if user is ADMIN?"
- "JWT token not validating"
- "User's role not working"

### Ask Dev 1 (Resources)
- "How do I check facility availability?"
- "What are open hours for resource X?"
- "Maintenance blackout blocks booking?"

### Ask Dev 2 (Bookings)
- "How do I know if booking conflicts?"
- "How do I approve a booking?"
- "What's the booking status flow?"

### Ask Dev 3 (Tickets)
- "How do I upload multiple files?"
- "Should this comment be internal?"
- "Is SLA breached?"

### Database Issues?
- Check [DATABASE_IMPLEMENTATION_GUIDE.md](DATABASE_IMPLEMENTATION_GUIDE.md) first
- Then [DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md)
- Then [DATABASE_SCHEMA_MYSQL.sql](DATABASE_SCHEMA_MYSQL.sql)

---

## ✅ FINAL CHECKLIST BEFORE SUBMISSION

- [ ] All 16 tables created successfully
- [ ] All indexes exist (run SHOW INDEXES)
- [ ] Sample data inserted and queries work
- [ ] All 26+ API endpoints implemented
- [ ] 80%+ code coverage with tests
- [ ] Frontend integrated and tested
- [ ] No compiler warnings
- [ ] No security vulnerabilities
- [ ] Documentation complete
- [ ] README updated
- [ ] Code committed, no conflicts

---

**You're ready to start! Pick your module above and get coding! 🚀**

**Questions?** Check the appropriate documentation file first!

Last Updated: 21 April 2026  
Status: Production Ready ✓
