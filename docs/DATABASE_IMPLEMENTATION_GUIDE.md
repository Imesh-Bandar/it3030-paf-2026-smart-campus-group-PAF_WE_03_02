# Database Implementation Guide - All Developers
**Version**: 2.0  
**Date**: 21 April 2026  
**Deadline**: 27 April 2026 (6 days remaining)

---

## 🎯 Quick Start Checklist

### Immediate Actions (Today)
- [ ] **Everyone**: Read [DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md)
- [ ] **Everyone**: Review your module's tables below
- [ ] **Database Admin**: Choose SQL version (MySQL recommended for Spring Boot)
- [ ] **Database Admin**: Import schema file into your dev environment
- [ ] **All Devs**: Verify connection string in `application.yml`

### This Week
- [ ] Complete your module tables implementation
- [ ] Create Repository interfaces for your tables
- [ ] Create Service layer for business logic
- [ ] Create Controller with API endpoints
- [ ] Write unit tests (minimum 80% coverage)

### Before Submission (27 April)
- [ ] All CRUD operations working
- [ ] All API endpoints tested with Postman
- [ ] Frontend integration complete
- [ ] Security review completed
- [ ] Documentation updated

---

## 📚 Database Documentation Files

| File | Purpose | For |
|------|---------|-----|
| [DATABASE_SCHEMA_MYSQL.sql](DATABASE_SCHEMA_MYSQL.sql) | **Start here** - Ready-to-import MySQL 8.0+ schema with all 16 tables, 40+ indexes, and constraints | **Database Setup** |
| [COMPLETE_DATABASE_SCHEMA.sql](COMPLETE_DATABASE_SCHEMA.sql) | PostgreSQL version with 23+ useful queries and SLA calculations | Reference/Learning |
| [DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md) | Per-developer checklist and API endpoints each module must support | **Your Implementation** |

---

## 🗂️ DATABASE STRUCTURE SUMMARY

### Tables by Module

**DEV 1 - FACILITIES (4 tables)**
```
resources ────────── availability_windows
       ├─ maintenance_blackouts
       └─ resource_images
```
- Status: ⏳ Implementation phase
- Key challenge: Conflict-free availability validation
- Endpoints: 6+
- Dependencies: None

**DEV 2 - BOOKINGS (3 tables)**
```
bookings ────────────────── booking_status_history
   └─ waitlist_entries
```
- Status: ⏳ Implementation phase
- Key challenge: Detect overlapping bookings using unique index
- Endpoints: 7+
- Dependencies: Dev 1 (resources table)

**DEV 3 - TICKETS (4 tables)**
```
tickets ────────── ticket_comments ────── ticket_attachments
    └─ ticket_status_history
```
- Status: ⏳ Implementation phase
- Key challenge: Multi-part file uploads + internal comments
- Endpoints: 8+
- Dependencies: Users table (from Dev 4)

**DEV 4 - AUTH & NOTIFICATIONS (5 tables)**
```
users ────── refresh_tokens
   ├─ security_activity_logs
   ├─ notifications
   └─ notification_preferences
```
- Status: ✅ COMPLETE
- Implementation: 13 endpoints fully functional
- Dependencies: None (foundational)

---

## 💡 KEY IMPLEMENTATION POINTS BY MODULE

### ✅ DEV 4: AUTH & NOTIFICATIONS (COMPLETE)

**Tables Created**: 5  
**Status**: Production-ready  
**Endpoints**: 13  

#### What's Already Implemented
- ✅ User management with OAuth integration
- ✅ JWT refresh token handling
- ✅ Security activity logging
- ✅ Notification system with preferences
- ✅ Role-based access control (STUDENT/STAFF/TECHNICIAN/ADMIN)
- ✅ All 13 API endpoints functional

#### How Others Depend on This
```
Your user.id is referenced by:
├─ bookings.booker_id
├─ bookings.approved_by
├─ bookings.checked_in_by
├─ tickets.reporter_id
├─ tickets.assignee_id
├─ ticket_comments.author_id
├─ ticket_attachments.uploaded_by
├─ notifications.user_id
└─ security_activity_logs.user_id
```

**Critical**: Never delete users (use soft-delete with `deleted_at`)

---

### ⏳ DEV 1: FACILITIES & RESOURCES

**Tables to Create**: 4  
**Dependencies**: None  
**Key Indexes**: 4

#### Table: resources
```sql
PRIMARY KEY: id (UUID)
UNIQUE: resource_code (e.g., "LH-101")
STATUS: 'ACTIVE' | 'OUT_OF_SERVICE' | 'UNDER_MAINTENANCE'
INDEXES NEEDED:
  - idx_resources_type (for filtering by LECTURE_HALL, LAB, etc.)
  - idx_resources_status (for status queries)
  - idx_resources_location (for location search)
```

#### Table: availability_windows
```sql
Defines operating hours per day of week
Example: Monday-Friday 8am-6pm, Saturday 9am-2pm

KEY CHALLENGE: 
- Validate end_time > start_time
- Ensure day_of_week is 0-6 (Sunday=0, Saturday=6)
- Quick lookup for booking conflict detection
```

#### Table: maintenance_blackouts
```sql
Temporary unavailability periods

IMPORTANT:
- Can overlap with availability windows
- Blocks ALL bookings during this period
- created_by tracks who scheduled maintenance
- SLA impact: No approvals during blackout
```

#### Table: resource_images
```sql
Photos/images for facility browsing

TIPS:
- Store URLs, paths optionally
- display_order for carousel
- Soft images only, don't block resource deletion
```

#### Dev 1 Implementation Checklist
- [ ] Create all 4 tables with constraints
- [ ] Create Repository interfaces extending JpaRepository
- [ ] Create ResourceService with methods:
  - `getAllResources()`
  - `getResourceById(id)`
  - `createResource(data)`
  - `updateResource(id, data)`
  - `checkAvailability(resourceId, date, start, end)`
  - `getMaintenanceBlackouts(resourceId)`
- [ ] Create RestController with 6+ endpoints:
  - `GET /api/v1/resources`
  - `GET /api/v1/resources/{id}`
  - `POST /api/v1/resources` (ADMIN)
  - `PUT /api/v1/resources/{id}` (ADMIN)
  - `DELETE /api/v1/resources/{id}` (ADMIN)
  - `GET /api/v1/resources/{id}/availability`
- [ ] Write tests for conflict detection
- [ ] Integrate with Dev 2's booking system

---

### ⏳ DEV 2: BOOKINGS

**Tables to Create**: 3  
**Dependencies**: Dev 1 (resources)  
**Key Challenge**: Prevent overlapping bookings

#### Table: bookings
```sql
PRIMARY KEY: id (UUID)
UNIQUE CONSTRAINT: (resource_id, booking_date, start_time, end_time)
  WHERE status IN ('PENDING', 'APPROVED')
  AND deleted_at IS NULL

STATUS: 'PENDING' → 'APPROVED' → 'COMPLETED'
       or 'REJECTED' / 'CANCELLED'

QR_TOKEN: For check-in verification

CRITICAL CONSTRAINT:
✅ UNIQUE index prevents overlapping bookings!
  This is handled by MySQL UNIQUE INDEX with WHERE clause.

PROBLEM SCENARIO:
❌ User A: 10:00-11:00 (APPROVED)
❌ User B: 10:30-11:30 (APPROVED) 
→ MySQL will REJECT this insertion!

✅ CORRECT:
  Unique index on (resource_id, booking_date, start_time, end_time)
  This ensures NO overlapping times for APPROVED/PENDING bookings
```

#### Table: booking_status_history
```sql
Audit trail for approval workflow

Each status change creates record:
- old_status: previous state
- new_status: new state
- changed_by: user_id who made change
- reason: why (e.g., "Facility double-booked")
- created_at: timestamp

Used for: Approval history, SLA calculations, disputes
```

#### Table: waitlist_entries
```sql
Queue for when booking is full

WORKFLOW:
1. User A books 10:00-11:00 (APPROVED)
2. User B tries same time (goes to WAITLIST)
3. User A cancels
4. User B receives OFFERED notification
5. User B has 24hrs to accept/decline
6. If accept → new booking created, status → ACCEPTED
7. If decline → status → DECLINED, next person offered
```

#### Dev 2 Implementation Checklist
- [ ] Create 3 tables
- [ ] **TEST OVERLAP DETECTION**:
  ```sql
  INSERT INTO bookings VALUES (..., 'APPROVED'); -- Should fail if overlap
  ```
- [ ] Create BookingRepository with methods:
  - `findConflictingBookings(resourceId, date, start, end)`
  - `getApprovedBookings(resourceId)`
  - `getUserBookings(userId)`
- [ ] Create BookingService:
  - `checkAvailability()` - calls Dev 1's availability service
  - `detectConflict()` - uses unique index
  - `approveBooking()`
  - `rejectBooking()`
  - `cancelBooking()` - triggers waitlist promotion
  - `promoteFromWaitlist()`
- [ ] Create BookingController:
  - `POST /api/v1/bookings` - Create with conflict detection
  - `GET /api/v1/bookings` - List with filters
  - `GET /api/v1/bookings/{id}`
  - `PUT /api/v1/bookings/{id}/approve` (ADMIN)
  - `PUT /api/v1/bookings/{id}/reject` (ADMIN)
  - `PUT /api/v1/bookings/{id}/cancel`
  - `POST /api/v1/bookings/{id}/check-in` - Verify QR
- [ ] Generate QR codes using `com.google.zxing:core`
- [ ] Write integration tests for:
  - Booking same time → should fail
  - Back-to-back bookings → should work
  - Maintenance blackout blocking → should fail
  - Waitlist promotion → should auto-notify

**⚠️ CRITICAL TEST CASE**:
```
Scenario: Prevent double-booking
Time: 10:00-11:00

Attempt 1: INSERT booking (10:00-11:00) → SUCCESS
Attempt 2: INSERT booking (10:30-11:30) → FAIL (violates unique index)
Attempt 3: INSERT booking (11:00-12:00) → SUCCESS (no overlap)
Attempt 4: INSERT booking (09:00-10:00) → SUCCESS (no overlap)
```

---

### ⏳ DEV 3: TICKETS & MAINTENANCE

**Tables to Create**: 4  
**Dependencies**: Dev 4 (users)  
**Key Challenge**: Multi-part file uploads

#### Table: tickets
```sql
PRIMARY KEY: id (UUID)
UNIQUE: ticket_number (e.g., "TK-001")

CATEGORY: ELECTRICAL | PLUMBING | IT_EQUIPMENT | HVAC | STRUCTURAL | OTHER
PRIORITY: LOW | MEDIUM | HIGH | CRITICAL (affects SLA)
STATUS: OPEN → IN_PROGRESS → RESOLVED → CLOSED
        or REJECTED

WORKFLOW:
1. Reporter creates with description + photo
2. Assigned to Technician
3. Technician updates status → first_response_at set
4. Technician adds comments + evidence
5. Mark RESOLVED → resolved_at set
6. Verify SLA: resolved_at - created_at < SLA_TIME
   - CRITICAL: < 4 hours
   - HIGH: < 8 hours
   - MEDIUM: < 24 hours
   - LOW: < 48 hours
```

#### Table: ticket_comments
```sql
Discussion thread

KEY FEATURE: is_internal
- is_internal = TRUE: Only technicians/admin see
- is_internal = FALSE: Reporter can see

Use Case:
- Public: "We're investigating this issue"
- Internal: "The projector bulb needs replacement (~$200)"
- Public: "Issue resolved, bulb replaced"
```

#### Table: ticket_attachments
```sql
File uploads (photos, documents, etc.)

IMPORTANT:
- Store in: /uploads/tickets/{ticketId}/
- Validate: MAX 3 files, 5MB each
- MIME types: image/*, application/pdf
- Soft-delete on comment deletion

ON DELETION:
- Keep record with deleted_at
- Remove file from disk (async)
- Maintain storage audit trail
```

#### Table: ticket_status_history
```sql
Audit of all status transitions

Tracks: Who changed it, when, why, from what status
Used for: SLA calculations, dispute resolution, metrics
```

#### Dev 3 Implementation Checklist
- [ ] Create 4 tables
- [ ] Create TicketRepository with methods:
  - `findByAssigneeId(userId)` - Technician's queue
  - `findBySlaBreached(true)` - SLA alerts
  - `findByCategoryAndStatus()` - Analytics
- [ ] Create TicketService with:
  - `createTicket()` - multipart file support
  - `assignTicket()` - set assignee_id + notify
  - `updateStatus()` - calculate SLA, create history record
  - `calculateSLA()` - compare resolved_at vs priority thresholds
  - `addComment()` - is_internal flag support
  - `uploadAttachment()` - file validation + storage
- [ ] Create TicketController:
  - `POST /api/v1/tickets` (multipart/form-data)
  - `GET /api/v1/tickets`
  - `GET /api/v1/tickets/{id}`
  - `PUT /api/v1/tickets/{id}/status` (ADMIN/TECH)
  - `PUT /api/v1/tickets/{id}/assign` (ADMIN)
  - `DELETE /api/v1/tickets/{id}` (soft-delete)
  - `POST /api/v1/tickets/{id}/comments`
  - `DELETE /api/v1/tickets/{id}/comments/{commentId}`
- [ ] Create CommentController (if separate)
- [ ] Create AttachmentController:
  - `GET /api/v1/tickets/{id}/attachments`
  - `DELETE /api/v1/tickets/{id}/attachments/{attachmentId}`
- [ ] **File Upload Handler**:
  - Create `/uploads/tickets/` directory structure
  - Implement disk storage (use UUID for filenames)
  - Add virus scanning if needed
  - Implement async deletion
- [ ] **SLA Calculator**:
  ```java
  boolean isSLABreached(Priority priority, LocalDateTime created, LocalDateTime resolved) {
    if (resolved == null) return false;
    Duration elapsed = Duration.between(created, resolved);
    return switch(priority) {
      case CRITICAL -> elapsed.toHours() > 4;
      case HIGH -> elapsed.toHours() > 8;
      case MEDIUM -> elapsed.toHours() > 24;
      case LOW -> elapsed.toHours() > 48;
    };
  }
  ```
- [ ] Write tests for:
  - Multipart form-data uploads
  - File size validation (5MB max)
  - MIME type validation
  - Internal vs public comments
  - SLA calculations
  - Status transition validation

**⚠️ TRICKY PART - Multipart Upload**:
```java
@PostMapping("/tickets")
public ResponseEntity<TicketDTO> createTicket(
  @RequestParam String title,
  @RequestParam String description,
  @RequestParam String category,
  @RequestParam String priority,
  @RequestPart(required = false) MultipartFile[] attachments
) {
  // Validate file sizes: max 3 files, 5MB each
  // Save to disk with UUID filename
  // Store metadata in ticket_attachments table
  // Return ticket with attachment IDs
}
```

---

## 🔗 INTEGRATION FLOW (How Modules Connect)

```
Frontend Request
    ↓
Dev 4: AuthController validates JWT token + checks role
    ↓
Dev 1/2/3: Your Controller receives request
    ↓
Your Service validates business logic
    ↓
Your Repository queries database
    ↓
Response with data
    ↓
Frontend displays
    ↓
User action triggers notification
    ↓
Dev 4: NotificationService sends alert
```

### Example: Approve Booking Workflow
```
1. Admin calls: PUT /api/v1/bookings/123/approve
   │
2. Dev 4: JWT verified, role=ADMIN ✓
   │
3. Dev 2: BookingController.approveBooking()
   │
4. Dev 2: BookingService.approveBooking(bookingId)
   ├─ Set status = 'APPROVED'
   ├─ Set approved_by = currentUser.id
   ├─ Set approved_at = NOW()
   ├─ Create BookingStatusHistory record
   └─ Return updated booking
   │
5. Dev 4: NotificationService.notify()
   ├─ Create notification (BOOKING_APPROVED)
   ├─ Send to booker_id user
   └─ Check notification_preferences.booking_notifications
   │
6. Frontend: WebSocket or Poll /api/v1/notifications
   ├─ Receive notification
   └─ Update UI with badge count
```

---

## ⚡ CRITICAL CONSTRAINTS (Don't Skip!)

### MUST HAVE Indexes (Performance)
```
✅ idx_bookings_resource_date_status
   Purpose: Conflict detection query is fast
   
✅ idx_tickets_assignee_status
   Purpose: Technician's queue load is fast
   
✅ idx_notifications_user_read
   Purpose: Get unread count is fast

Skip these = slow queries = failed performance review
```

### MUST HAVE Constraints (Data Integrity)
```
✅ UNIQUE (resource_id, booking_date, start_time, end_time)
   Prevents overlapping bookings at MySQL level
   
✅ CHECK status IN (...)
   Prevents invalid status values at DB level
   
✅ FOREIGN KEY ... ON DELETE CASCADE
   Auto-clean when parent deleted (avoid orphans)
   
✅ deleted_at for soft-delete
   Allows recovery, maintains referential integrity
```

### MUST HAVE in Code
```
✅ @Transactional on Service methods
   Ensures consistency
   
✅ @Validated on Controller parameters
   Catches validation errors early
   
✅ try-catch for database operations
   Handle constraint violations gracefully
   
✅ Parameterized queries (JPA handles this)
   Prevents SQL injection
```

---

## 📝 SIMPLE CHECKLIST: Am I Done?

### Data Layer
- [ ] All tables created with correct types and constraints
- [ ] All indexes created (test with EXPLAIN ANALYZE)
- [ ] Foreign keys set up correctly
- [ ] Can insert test data without errors

### Repository Layer
- [ ] Repository interface extends JpaRepository<Entity, ID>
- [ ] Custom @Query methods for complex queries
- [ ] Methods return Optional<T> or List<T>
- [ ] Tests verify all queries work

### Service Layer
- [ ] All business logic in Service, not Controller
- [ ] Service methods marked @Transactional
- [ ] Error handling with custom exceptions
- [ ] Tests verify logic with mocked Repository

### Controller Layer
- [ ] All HTTP methods mapped correctly
- [ ] @RequestBody / @PathVariable / @RequestParam correct
- [ ] Response status codes correct (201 for POST, etc.)
- [ ] CORS headers set for frontend
- [ ] API documentation (Swagger/JavaDoc)

### Frontend Integration
- [ ] Fetch calls match API paths exactly
- [ ] Headers include Authorization token
- [ ] Error handling for 4xx/5xx responses
- [ ] Loading states for async operations

### Testing
- [ ] Unit tests for Repository queries
- [ ] Unit tests for Service logic
- [ ] Integration tests for Controller endpoints
- [ ] Test data cleanup (use @DirtiesContext or @Transactional)
- [ ] Minimum 80% code coverage

### Security
- [ ] All modifying endpoints require @Secured or @PreAuthorize
- [ ] Role validation correct (ADMIN/TECH/USER)
- [ ] No sensitive data in logs
- [ ] Database credentials not hardcoded

### Documentation
- [ ] API endpoints documented with request/response examples
- [ ] Complex queries commented explaining logic
- [ ] README updated with setup instructions
- [ ] Schema diagram created

---

## 🚀 SUBMISSION REQUIREMENTS

### Code Deliverables
- [ ] All code committed to appropriate branch
- [ ] No merge conflicts
- [ ] Build passes: `mvn clean package`
- [ ] No compiler warnings
- [ ] Tests pass: `mvn test`

### Documentation Deliverables
- [ ] API documentation (Swagger UI accessible)
- [ ] Database schema documented
- [ ] Setup instructions in README
- [ ] Implementation summary in IMPLEMENTATION_SUMMARY.md

### Quality Metrics
- [ ] Code coverage > 80%
- [ ] 0 security vulnerabilities (SonarQube)
- [ ] All tests pass
- [ ] API tested with Postman collection

---

## 📞 TROUBLESHOOTING

### "Unique constraint violated"
→ You're trying to insert overlapping booking times  
✅ Check query filtering: `WHERE status IN ('PENDING', 'APPROVED')`

### "Foreign key constraint fails"
→ Parent row doesn't exist  
✅ Check: resource exists before booking, user exists, etc.

### "Query takes 5+ seconds"
→ Missing index  
✅ Add index to WHERE clause column: `CREATE INDEX idx_name ON table(column)`

### "NullPointerException in Service"
→ Optional returned from Repository was empty  
✅ Use: `repository.findById(id).orElseThrow(() → NotFoundException)`

### "Multipart upload fails"
→ File too large or wrong MIME type  
✅ Check: Content-Type header, file size < 5MB, validate MIME types

---

## 📅 TIMELINE TO SUBMISSION

**Today (21 Apr)**: Everyone read this document + schemas  
**22-23 Apr**: Create tables, test with sample data  
**24 Apr**: Complete Service + Controller layer  
**25 Apr**: Write tests, achieve 80% coverage  
**26 Apr**: Integration testing, fix bugs  
**27 Apr**: Final review, submit  

---

**You've got this! 💪**

Last Updated: 21 April 2026  
Questions? Check the PostgreSQL/MySQL schema files for examples.
