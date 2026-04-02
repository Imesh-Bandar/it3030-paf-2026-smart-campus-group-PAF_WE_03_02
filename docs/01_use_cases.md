# Smart Campus Operations Hub — Use Case Specifications

> **Project:** Smart Campus Operations Hub  
> **Course:** IT3030 – Programming Applications & Frameworks  
> **Team:** Group PAF_WE_03_02  
> **Version:** 1.0  
> **Date:** March 2026

---

## Table of Contents

1. [Use Case Overview](#use-case-overview)
2. [Actor Definitions](#actor-definitions)
3. [Module A: Facilities & Asset Catalogue](#module-a-facilities--asset-catalogue)
4. [Module B: Booking Management](#module-b-booking-management)
5. [Module C: Maintenance & Incident Ticketing](#module-c-maintenance--incident-ticketing)
6. [Module D: Authentication & Notifications](#module-d-authentication--notifications)
7. [Use Case Diagram](#use-case-diagram)

---

## Use Case Overview

The Smart Campus Operations Hub manages four core functional areas:

- **Facilities Management** — Browse, search, and manage campus facilities and assets
- **Booking System** — Request, approve, and manage facility bookings
- **Maintenance Tracking** — Report incidents and track maintenance tickets
- - **User Management** — Google OAuth authentication, notifications, role-based access

This document defines all use cases organized by module, specifying actors, preconditions, main flows, alternate flows, and postconditions.

---

## Actor Definitions

| **Actor**      | **Description**                    | **Access Level**                                                |
| -------------- | ---------------------------------- | --------------------------------------------------------------- |
| **Guest**      | Unauthenticated visitor            | Public read-only access to facility catalogue                   |
| **User**       | Authenticated student/staff member | Can browse facilities, create bookings, report incidents        |
| **Admin**      | Administrative staff               | Full CRUD on resources, approve/reject bookings, manage tickets |
| **Technician** | Maintenance personnel              | View and update maintenance tickets, mark incidents resolved    |
| **System**     | Automated background processes     | Sends notifications, expires bookings, runs scheduled tasks     |

---

## Module A: Facilities & Asset Catalogue

### UC-FA-01: Browse Facility Catalogue

**Primary Actor:** Guest, User, Admin, Technician  
**Goal:** View available facilities and assets with filtering and search  
**Preconditions:** None (public access)

**Main Flow:**

1. Actor navigates to the facilities page
2. System displays a paginated grid of facilities with:
   - Facility name, type, capacity
   - Availability indicator (Available / Occupied / Under Maintenance)
   - Thumbnail image
3. Actor applies filters (type, capacity range, availability status)
4. System updates the display with filtered results
5. Actor searches by keyword in the search box
6. System returns matching facilities based on name and description

**Alternate Flow 1A: No Results**

- 3a. No facilities match the filter criteria
- 3b. System displays an empty state with "No facilities found" message

**Postconditions:** Facility list is displayed according to filters

---

### UC-FA-02: View Facility Details

**Primary Actor:** Guest, User, Admin, Technician  
**Goal:** View detailed information about a specific facility  
**Preconditions:** Facility must exist in the system

**Main Flow:**

1. Actor clicks on a facility card from the catalogue
2. System navigates to facility detail page showing:
   - Full specifications (capacity, location, amenities)
   - Photo gallery
   - Real-time availability calendar (next 30 days)
   - Technical specifications
   - Booking history (Admin only)
3. If authenticated and role is USER, system displays "Book Now" button
4. Actor reviews facility information

**Alternate Flow 2A: Facility Unavailable**

- 2a. Facility status is "Under Maintenance"
- 2b. System displays maintenance notice banner
- 2c. "Book Now" button is disabled with tooltip explanation

**Postconditions:** Facility details are displayed

---

### UC-FA-03: Create New Facility (Admin)

**Primary Actor:** Admin  
**Goal:** Add a new facility or asset to the system  
**Preconditions:** Actor is authenticated with ADMIN role

**Main Flow:**

1. Admin navigates to Admin Dashboard → Resources → Add New
2. System displays facility creation form
3. Admin enters required fields:
   - Name (required)
   - Type (dropdown: Lab, Classroom, Hall, Equipment, Sports Facility)
   - Capacity (integer)
   - Location (building + room number)
   - Description (textarea)
4. Admin uploads facility images (max 5 files, 5MB each, JPEG/PNG)
5. Admin clicks "Create Facility"
6. System validates inputs:
   - All required fields present
   - Images within size/format constraints
7. System creates facility record with status = "Available"
8. System displays success message and redirects to facility detail page

**Alternate Flow 3A: Validation Error**

- 6a. Required field is missing or invalid
- 6b. System displays inline error messages
- 6c. Admin corrects errors and resubmits

**Postconditions:** New facility is created and visible in catalogue

---

### UC-FA-04: Update Facility (Admin)

**Primary Actor:** Admin  
**Goal:** Modify existing facility information  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Facility exists

**Main Flow:**

1. Admin navigates to facility detail page
2. Admin clicks "Edit" button
3. System displays edit form pre-populated with current values
4. Admin modifies fields (name, capacity, status, description)
5. Admin clicks "Save Changes"
6. System validates inputs
7. System updates facility record
8. System displays success message

**Alternate Flow 4A: Facility Has Active Bookings**

- 5a. Admin attempts to set status to "Under Maintenance"
- 5b. System checks for active/confirmed bookings
- 5c. If active bookings exist, system displays warning modal listing affected bookings
- 5d. Admin confirms action or cancels

**Postconditions:** Facility information is updated

---

### UC-FA-05: Delete Facility (Admin)

**Primary Actor:** Admin  
**Goal:** Remove a facility from the system (soft delete)  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Facility exists

**Main Flow:**

1. Admin navigates to facility detail page
2. Admin clicks "Delete" button
3. System checks for dependencies:
   - Active bookings (PENDING or CONFIRMED status)
   - Open maintenance tickets
4. If no blockers found, system displays confirmation dialog
5. Admin confirms deletion
6. System soft-deletes facility (sets deleted_at timestamp)
7. System creates notification for users with bookings (if any)
8. System redirects to catalogue with success message

**Alternate Flow 5A: Active Bookings Exist**

- 3a. Facility has active bookings
- 3b. System returns HTTP 409 Conflict
- 3c. System displays error: "Cannot delete facility with active bookings"
- 3d. Admin cancels action

**Postconditions:** Facility is soft-deleted and hidden from catalogue

---

### UC-FA-06: Check Facility Availability

**Primary Actor:** User, Admin  
**Goal:** View available time slots for a facility within a date range  
**Preconditions:**

- Actor is authenticated
- Facility exists and status is "Available"

**Main Flow:**

1. Actor navigates to facility detail page
2. System displays availability calendar for the next 30 days
3. Actor selects a specific date
4. System fetches all bookings for that date
5. System displays a timeline view showing:
   - Occupied time slots (red)
   - Available time slots (green)
   - Conflicting bookings with details
6. Actor can navigate to different dates

**Alternate Flow 6A: Facility Fully Booked**

- 4a. All time slots for selected date are occupied
- 4b. System displays "Fully Booked" badge
- 4c. System suggests next available date

**Postconditions:** Availability information is displayed

---

## Module B: Booking Management

### UC-BM-01: Create Booking Request

**Primary Actor:** User  
**Goal:** Request to book a facility for a specific time period  
**Preconditions:**

- Actor is authenticated with USER role
- Facility exists and status is "Available"

**Main Flow:**

1. User navigates to facility detail page
2. User clicks "Book Now" button
3. System displays booking form modal with:
   - Date picker (minimum: tomorrow, maximum: 90 days ahead)
   - Start time dropdown (30-min intervals)
   - End time dropdown
   - Purpose field (textarea, required)
4. User fills in booking details
5. User clicks "Submit Request"
6. System validates:
   - Start time is in the future
   - End time is after start time
   - Duration is between 30 minutes and 8 hours
7. System checks for overlapping bookings
8. If no conflicts, system creates booking with status = "PENDING"
9. System creates notification for ADMIN users
10. System displays success message: "Booking request submitted for approval"

**Alternate Flow 1A: Time Conflict Detected**

- 7a. Requested time overlaps with an existing CONFIRMED booking
- 7b. System returns HTTP 409 Conflict
- 7c. System displays conflict details with alternative suggestions
- 7d. User modifies time or cancels

**Alternate Flow 1B: Validation Error**

- 6a. Validation fails (e.g., start time in past, invalid duration)
- 6b. System displays inline error messages
- 6c. User corrects inputs

**Postconditions:** Booking is created with PENDING status

---

### UC-BM-02: View My Bookings

**Primary Actor:** User  
**Goal:** View all personal bookings with status and history  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. User navigates to "My Bookings" page
2. System fetches all bookings where user_id matches authenticated user
3. System displays bookings grouped by status:
   - **PENDING** (awaiting approval)
   - **CONFIRMED** (approved by admin)
   - **CANCELLED** (cancelled by user/admin)
   - **REJECTED** (denied by admin)
   - **COMPLETED** (end time has passed)
4. Each booking card displays:
   - Facility name and image
   - Date and time
   - Status badge with color coding
   - Action buttons (Cancel for PENDING/CONFIRMED)
5. User can filter by status and search by facility name
6. User can click booking to view full details

**Alternate Flow 2A: No Bookings Found**

- 2a. User has no bookings
- 2b. System displays empty state: "You haven't made any bookings yet"

**Postconditions:** User's bookings are displayed

---

### UC-BM-03: Cancel Own Booking

**Primary Actor:** User  
**Goal:** Cancel a PENDING or CONFIRMED booking  
**Preconditions:**

- Actor is authenticated
- Actor is the booking owner
- Booking status is PENDING or CONFIRMED

**Main Flow:**

1. User navigates to "My Bookings" page
2. User clicks "Cancel" button on a booking card
3. System displays confirmation dialog: "Are you sure you want to cancel this booking?"
4. User confirms cancellation
5. System updates booking status to "CANCELLED"
6. System records cancellation timestamp and reason (user initiated)
7. If status was CONFIRMED, system creates notification for facility admin
8. System displays success message
9. System refreshes booking list

**Alternate Flow 3A: Booking Already Started**

- 4a. Current time is past the booking start time
- 4b. System displays error: "Cannot cancel a booking that has already started"
- 4c. Action is aborted

**Postconditions:** Booking status is CANCELLED

---

### UC-BM-04: Approve Booking (Admin)

**Primary Actor:** Admin  
**Goal:** Approve a pending booking request  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Booking status is PENDING

**Main Flow:**

1. Admin navigates to "Pending Bookings" queue
2. System displays all bookings with status = PENDING sorted by created date
3. Admin clicks on a booking card to view details
4. System displays booking detail modal with:
   - User information
   - Facility details
   - Requested date/time
   - Purpose
5. Admin clicks "Approve" button
6. System checks for conflicts with other CONFIRMED bookings
7. If no conflicts, system updates booking status to "CONFIRMED"
8. System creates notification for the requesting user
9. System sends confirmation email to user
10. System displays success message
11. Booking is removed from pending queue

**Alternate Flow 4A: Conflict Detected at Approval**

- 6a. Another admin has approved a conflicting booking since this request was made
- 6b. System displays error: "Conflict detected with another confirmed booking"
- 6c. Admin must reject this booking

**Postconditions:** Booking status is CONFIRMED, user is notified

---

### UC-BM-05: Reject Booking (Admin)

**Primary Actor:** Admin  
**Goal:** Reject a pending booking request with a reason  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Booking status is PENDING

**Main Flow:**

1. Admin navigates to "Pending Bookings" queue
2. Admin clicks on a booking card
3. Admin clicks "Reject" button
4. System displays rejection form modal with:
   - Required "Reason" textarea
5. Admin enters rejection reason (e.g., "Facility under maintenance", "Duplicate request")
6. Admin clicks "Submit Rejection"
7. System validates that reason is not empty
8. System updates booking status to "REJECTED"
9. System stores rejection reason
10. System creates notification for requesting user including rejection reason
11. System sends rejection email to user
12. System displays success message

**Alternate Flow 5A: Reason Not Provided**

- 7a. Admin submits without entering a reason
- 7b. System displays validation error: "Rejection reason is required"
- 7c. Admin must provide reason before proceeding

**Postconditions:** Booking status is REJECTED with reason recorded

---

### UC-BM-06: View All Bookings (Admin)

**Primary Actor:** Admin  
**Goal:** View and manage all bookings across the system  
**Preconditions:** Actor is authenticated with ADMIN role

**Main Flow:**

1. Admin navigates to "All Bookings" page
2. System fetches all bookings from database
3. System displays bookings in a data table with columns:
   - Booking ID
   - User name
   - Facility name
   - Date & time
   - Status badge
   - Actions (View, Cancel, Approve/Reject)
4. Admin can:
   - Filter by status, date range, facility, user
   - Sort by any column
   - Search by user name or facility name
   - Export filtered results to CSV
5. Admin can click any booking to view full details

**Alternate Flow 6A: Apply Filters**

- 3a. Admin selects filters (e.g., Status = CONFIRMED, Date = This Week)
- 3b. System applies filters and updates table
- 3c. URL query params are updated for shareable filter state

**Postconditions:** All bookings are displayed with filtering options

---

### UC-BM-07: Cancel Any Booking (Admin)

**Primary Actor:** Admin  
**Goal:** Cancel any booking regardless of owner  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Booking exists

**Main Flow:**

1. Admin navigates to booking detail (from All Bookings page)
2. Admin clicks "Cancel Booking" button
3. System displays cancellation form with:
   - Reason field (required for admin cancellations)
4. Admin enters reason (e.g., "Emergency facility maintenance")
5. Admin confirms cancellation
6. System updates booking status to "CANCELLED"
7. System records admin ID and cancellation reason
8. System creates notification for booking owner
9. System sends email to booking owner with reason
10. System logs action in audit trail

**Alternate Flow 7A: Booking Already Completed**

- 5a. Booking end time has passed
- 5b. System displays warning: "This booking has already ended"
- 5c. Admin can still cancel for record-keeping purposes

**Postconditions:** Booking is cancelled with admin reason recorded

---

## Module C: Maintenance & Incident Ticketing

### UC-MT-01: Report Incident/Issue

**Primary Actor:** User, Admin, Technician  
**Goal:** Report a facility issue or request maintenance  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. Actor navigates to "Report Issue" page
2. System displays incident report form with fields:
   - Title (required, max 100 chars)
   - Facility (dropdown with search, required)
   - Description (textarea, required, max 1000 chars)
   - Severity (dropdown: Low, Medium, High, Critical)
   - Category (dropdown: Electrical, Plumbing, Equipment, Cleaning, Other)
   - Photo evidence (file upload, optional, max 5 images, 5MB each)
3. Actor fills in form details
4. Actor uploads photos (if applicable)
5. Actor clicks "Submit Report"
6. System validates inputs:
   - Required fields are filled
   - Images are within size/format constraints
7. System creates ticket with:
   - Status = "OPEN"
   - Assigned reporter_id = current user ID
   - Auto-generated ticket number (e.g., TICK-20260315-0001)
8. If severity is HIGH or CRITICAL, system immediately notifies all ADMIN and TECHNICIAN users
9. System displays success message with ticket number
10. System redirects to ticket detail page

**Alternate Flow 1A: Image Upload Fails**

- 5a. One or more images exceed size limit
- 5b. System displays error: "Image must be under 5MB"
- 5c. Actor removes or replaces oversized image

**Alternate Flow 1B: Facility Not Selected**

- 6a. Actor submits without selecting a facility
- 6b. System displays validation error
- 6c. Actor selects facility and resubmits

**Postconditions:** Incident ticket is created with OPEN status

---

### UC-MT-02: View My Tickets

**Primary Actor:** User  
**Goal:** View all personally reported tickets  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. User navigates to "My Tickets" page
2. System fetches all tickets where reporter_id matches authenticated user
3. System displays tickets in a list/card view showing:
   - Ticket number
   - Title
   - Facility name
   - Status badge (OPEN, IN_PROGRESS, RESOLVED)
   - Severity indicator
   - Created date
   - Last updated date
4. User can filter by status and severity
5. User can search by title or description
6. User can click on a ticket to view full details

**Alternate Flow 2A: No Tickets Found**

- 2a. User has not reported any tickets
- 2b. System displays empty state: "You haven't reported any issues yet"

**Postconditions:** User's tickets are displayed

---

### UC-MT-03: View Ticket Details

**Primary Actor:** User, Admin, Technician  
**Goal:** View full details of a specific ticket  
**Preconditions:**

- Actor is authenticated
- Ticket exists
- Actor is either: ticket reporter, ADMIN, or assigned TECHNICIAN

**Main Flow:**

1. Actor clicks on a ticket from list view
2. System fetches full ticket data including:
   - Ticket number, title, description
   - Facility information
   - Severity and category
   - Status with color-coded badge
   - Reporter details (name, contact)
   - Assigned technician (if any)
   - Photo evidence gallery
   - Status history timeline
   - Comment thread
3. System displays ticket detail page with all information
4. If actor is ADMIN or assigned TECHNICIAN, action buttons are visible:
   - Update Status
   - Assign Technician (ADMIN only)
   - Add Comment
5. Actor can view status history showing:
   - Status changes with timestamps
   - User who made the change
   - Comments added

**Alternate Flow 3A: Unauthorized Access**

- 1a. Actor is USER but not the ticket reporter
- 1b. System returns HTTP 403 Forbidden
- 1c. System redirects to 403 error page

**Postconditions:** Ticket details are displayed

---

### UC-MT-04: Update Ticket Status (Admin/Technician)

**Primary Actor:** Admin, Technician  
**Goal:** Change the status of a ticket  
**Preconditions:**

- Actor is authenticated with ADMIN or TECHNICIAN role
- Ticket exists
- If TECHNICIAN, actor must be assigned to this ticket

**Main Flow:**

1. Actor navigates to ticket detail page
2. Actor clicks "Update Status" button
3. System displays status update modal with:
   - Current status displayed
   - Status dropdown (OPEN → IN_PROGRESS → RESOLVED)
   - Optional notes field
4. Actor selects new status
5. Actor adds notes explaining status change (optional)
6. Actor clicks "Update Status"
7. System validates status transition (no backward transitions from RESOLVED)
8. System updates ticket status
9. System creates status history entry with:
   - Previous status
   - New status
   - Changed by (user ID)
   - Timestamp
   - Notes
10. System creates notification for ticket reporter
11. If new status is RESOLVED, system sends completion email to reporter
12. System displays success message

**Alternate Flow 4A: Invalid Status Transition**

- 7a. Actor attempts to change RESOLVED ticket back to OPEN
- 7b. System displays error: "Cannot reopen a resolved ticket. Create a new ticket instead."
- 7c. Action is aborted

**Alternate Flow 4B: Technician Not Assigned**

- 2a. Actor is TECHNICIAN but not assigned to this ticket
- 2b. System hides "Update Status" button
- 2c. System displays message: "You are not assigned to this ticket"

**Postconditions:** Ticket status is updated, history is recorded

---

### UC-MT-05: Assign Technician to Ticket (Admin)

**Primary Actor:** Admin  
**Goal:** Assign a technician to handle a ticket  
**Preconditions:**

- Actor is authenticated with ADMIN role
- Ticket exists
- Ticket status is OPEN or IN_PROGRESS

**Main Flow:**

1. Admin navigates to ticket detail page
2. Admin clicks "Assign Technician" button
3. System displays assignment modal with:
   - Dropdown of all users with TECHNICIAN role
   - Current assignment status
4. Admin selects a technician from dropdown
5. Admin clicks "Assign"
6. System validates that selected user has TECHNICIAN role
7. System updates ticket.assigned_to field
8. System creates notification for assigned technician
9. System sends email to technician with ticket details
10. System logs assignment in activity history
11. System displays success message
12. Ticket detail page is refreshed showing assigned technician

**Alternate Flow 5A: Reassign to Different Technician**

- 3a. Ticket already has an assigned technician
- 3b. System displays current assignee in modal
- 3c. Admin selects different technician
- 3d. System creates notification for both old and new technician

**Alternate Flow 5B: No Technicians Available**

- 3a. No users with TECHNICIAN role exist
- 3b. System displays message: "No technicians available. Create technician accounts first."

**Postconditions:** Ticket is assigned to a technician

---

### UC-MT-06: Add Comment to Ticket

**Primary Actor:** User, Admin, Technician  
**Goal:** Add a comment/update to a ticket thread  
**Preconditions:**

- Actor is authenticated
- Ticket exists
- Actor is either: ticket reporter, ADMIN, or assigned TECHNICIAN

**Main Flow:**

1. Actor navigates to ticket detail page
2. Actor scrolls to comment section at bottom
3. Actor types comment in textarea (max 500 chars)
4. Actor clicks "Add Comment" button
5. System validates comment is not empty
6. System creates comment record with:
   - Ticket ID
   - User ID (commenter)
   - Comment text
   - Timestamp
7. System refreshes comment thread showing new comment
8. System creates notification for:
   - Ticket reporter (if comment is from ADMIN/TECHNICIAN)
   - Assigned technician (if comment is from reporter)
   - ADMIN users (if comment is from reporter and ticket is unassigned)
9. System displays success message

**Alternate Flow 6A: Empty Comment**

- 5a. Actor submits empty comment
- 5b. System displays validation error: "Comment cannot be empty"
- 5c. Actor must enter text

**Postconditions:** Comment is added to ticket thread

---

### UC-MT-07: View All Tickets (Admin/Technician)

**Primary Actor:** Admin, Technician  
**Goal:** View and manage all tickets in the system  
**Preconditions:** Actor is authenticated with ADMIN or TECHNICIAN role

**Main Flow:**

1. Actor navigates to "All Tickets" page
2. If actor is ADMIN, system fetches all tickets
3. If actor is TECHNICIAN, system fetches only tickets assigned to that technician
4. System displays tickets in a Kanban board view with columns:
   - **OPEN** (red)
   - **IN_PROGRESS** (yellow)
   - **RESOLVED** (green)
5. Each ticket card shows:
   - Ticket number
   - Title
   - Facility name
   - Severity badge
   - Assigned technician avatar (if assigned)
6. Actor can drag-and-drop cards between columns to change status
7. Actor can filter by:
   - Severity (Low, Medium, High, Critical)
   - Facility
   - Assigned technician (ADMIN only)
8. Actor can switch to list view for detailed table

**Alternate Flow 7A: No Tickets Assigned (Technician)**

- 2a. Technician has no assigned tickets
- 2b. System displays empty state: "No tickets assigned to you yet"

**Alternate Flow 7B: Drag-Drop Status Update**

- 6a. Actor drags ticket card to different column
- 6b. System displays quick confirmation modal
- 6c. Actor confirms or cancels
- 6d. If confirmed, system updates status (same as UC-MT-04)

**Postconditions:** All relevant tickets are displayed with management options

---

## Module D: Authentication & Notifications

### UC-NA-01: Sign In with Google

**Primary Actor:** Guest  
**Goal:** Authenticate using Google OAuth 2.0  
**Preconditions:** User has a valid Google account

**Main Flow:**

1. Guest navigates to login page
2. System displays "Sign in with Google" button
3. Guest clicks button
4. System redirects to Google OAuth consent screen (GET /auth/google)
5. Guest logs into Google account (if not already logged in)
6. Guest authorizes the application
7. Google redirects back to callback URL (GET /auth/callback) with authorization code
8. System exchanges code for Google ID token
9. System validates ID token signature
10. System extracts user email and profile data
11. System checks if user exists in database:
    - If exists: retrieve user record
    - If new: create user record with default role = USER
12. System generates signed JWT access token (1 hour expiry)
13. System generates refresh token (7 days expiry)
14. System stores refresh token in database
15. System returns tokens to client
16. Client stores access token in memory and refresh token in httpOnly cookie
17. System redirects to appropriate dashboard based on role

**Alternate Flow 1A: User Cancels Authorization**

- 6a. Guest clicks "Cancel" on Google consent screen
- 6b. Google redirects back with error parameter
- 6c. System displays error message: "Sign-in cancelled"
- 6d. Guest remains on login page

**Alternate Flow 1B: Invalid Google Token**

- 9a. ID token signature validation fails
- 9b. System logs security event
- 9c. System returns HTTP 401 Unauthorized
- 9d. System displays error: "Authentication failed. Please try again."

**Alternate Flow 1C: Account Locked**

- 11a. User account exists but status is "locked"
- 11b. System denies access
- 11c. System displays error: "Your account has been locked. Contact admin."

**Postconditions:** User is authenticated and redirected to dashboard

---

### UC-NA-02: Access Protected Resource

**Primary Actor:** User, Admin, Technician  
**Goal:** Make an authenticated API request  
**Preconditions:** Actor has a valid JWT access token

**Main Flow:**

1. Client makes API request to protected endpoint (e.g., GET /api/v1/bookings)
2. Client includes Bearer token in Authorization header
3. System's JWT filter intercepts request
4. System extracts token from header
5. System validates token:
   - Signature is valid
   - Token is not expired
   - Token format is correct
6. System extracts user ID and role from token payload
7. System checks endpoint role requirements:
   - If endpoint requires ADMIN, verify user role is ADMIN
   - If endpoint requires TECHNICIAN, verify user role is TECHNICIAN
   - If endpoint allows USER, allow if role is USER or higher
8. If authorized, system sets SecurityContext with user details
9. System passes request to controller
10. Controller processes request and returns response

**Alternate Flow 2A: Token Missing**

- 2a. Authorization header is not present
- 2b. System returns HTTP 401 Unauthorized
- 2c. Response body: { "error": "Authentication required" }

**Alternate Flow 2B: Token Expired**

- 5a. Token expiry timestamp is in the past
- 5b. System returns HTTP 401 Unauthorized
- 5c. Response body: { "error": "Token expired" }
- 5d. Client attempts token refresh (see UC-NA-03)

**Alternate Flow 2C: Insufficient Permissions**

- 7a. User role does not match endpoint requirements
- 7b. System returns HTTP 403 Forbidden
- 7c. Response body: { "error": "Insufficient permissions" }

**Postconditions:** Request is processed or rejected based on authorization

---

### UC-NA-03: Refresh Access Token

**Primary Actor:** User, Admin, Technician  
**Goal:** Obtain a new access token using a refresh token  
**Preconditions:** Actor has a valid refresh token stored in httpOnly cookie

**Main Flow:**

1. Client detects access token is expired (receives 401 from API)
2. Client automatically sends request to POST /auth/refresh
3. System extracts refresh token from httpOnly cookie
4. System validates refresh token:
   - Token exists in database
   - Token is not expired
   - Token is not revoked
5. System extracts user ID from refresh token payload
6. System generates new access token (1 hour expiry)
7. System generates new refresh token (7 days expiry)
8. System revokes old refresh token in database
9. System stores new refresh token in database
10. System returns new access token in response body
11. System sets new refresh token as httpOnly cookie
12. Client stores new access token in memory
13. Client retries original failed request with new access token

**Alternate Flow 3A: Refresh Token Invalid**

- 4a. Refresh token is expired or does not exist in database
- 4b. System returns HTTP 401 Unauthorized
- 4c. Client clears auth state
- 4d. Client redirects to login page

**Alternate Flow 3B: Refresh Token Revoked**

- 4a. Refresh token has been manually revoked (e.g., due to logout or security event)
- 4b. System returns HTTP 401 Unauthorized
- 4c. Client redirects to login page

**Postconditions:** New access and refresh tokens are issued

---

### UC-NA-04: Log Out

**Primary Actor:** User, Admin, Technician  
**Goal:** End the current session and revoke tokens  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. Actor clicks "Log Out" button in navigation bar
2. Client sends request to POST /auth/logout
3. System extracts refresh token from httpOnly cookie
4. System marks refresh token as revoked in database
5. System clears httpOnly cookie
6. System returns success response
7. Client clears access token from memory
8. Client clears auth state from store
9. Client redirects to login page

**Alternate Flow 4A: Already Logged Out**

- 3a. No refresh token found in cookie
- 3b. System returns success anyway (idempotent operation)
- 3c. Client proceeds with redirect

**Postconditions:** User session is terminated, tokens are revoked

---

### UC-NA-05: View Notifications

**Primary Actor:** User, Admin, Technician  
**Goal:** View all notifications in reverse chronological order  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. Actor clicks notification bell icon in navigation bar
2. System displays notification count badge (unread notifications)
3. System opens notification dropdown/drawer
4. System fetches notifications via GET /api/v1/notifications?read=false
5. System displays list of unread notifications showing:
   - Notification icon (based on type)
   - Title
   - Message preview (truncated)
   - Timestamp (relative, e.g., "2 hours ago")
   - Link to related entity
6. Actor can:
   - Click notification to navigate to related page
   - Mark single notification as read
   - Mark all as read
   - View all notifications (full page)

**Alternate Flow 5A: No Unread Notifications**

- 4a. No unread notifications exist
- 4b. System displays empty state: "You're all caught up!"

**Alternate Flow 5B: View All Notifications Page**

- 6a. Actor clicks "View All" link
- 6b. System navigates to /notifications page
- 6c. System displays paginated list of all notifications (read and unread)
- 6d. Actor can filter by read/unread status

**Postconditions:** Notifications are displayed

---

### UC-NA-06: Mark Notification as Read

**Primary Actor:** User, Admin, Technician  
**Goal:** Mark one or all notifications as read  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. Actor views notification dropdown
2. Actor clicks "Mark all as read" button
3. System sends request to PUT /api/v1/notifications/read-all
4. System updates all notifications where user_id matches and is_read = false
5. System sets is_read = true, read_at = current timestamp
6. System returns success response
7. Client updates notification state
8. Client clears unread count badge
9. System refreshes notification list

**Alternate Flow 6A: Mark Single Notification**

- 2a. Actor clicks on a single notification
- 2b. System sends request to PUT /api/v1/notifications/{id}/read
- 2c. System updates only that notification
- 2d. System navigates to related entity (e.g., booking detail, ticket detail)

**Postconditions:** Notification(s) are marked as read

---

### UC-NA-07: Receive Notification (System)

**Primary Actor:** System (automated trigger)  
**Goal:** Create and deliver a notification based on a system event  
**Preconditions:** A notification-triggering event occurs

**Main Flow:**

1. System event occurs (e.g., booking approved, ticket status changed, facility deleted)
2. Application code invokes notification service asynchronously (@Async)
3. Notification service determines:
   - Recipient user ID(s)
   - Notification type (BOOKING, TICKET, SYSTEM)
   - Title and message content
   - Related entity ID and type
4. System creates notification record in database with:
   - user_id
   - type
   - title
   - message
   - entity_id and entity_type (for deep linking)
   - is_read = false
   - created_at = current timestamp
5. System increments unread notification count for user
6. If user is currently online:
   - System sends notification via WebSocket/SSE (real-time)
7. System logs notification creation

**Trigger Events:**

- Booking approved → notify booking requester
- Booking rejected → notify booking requester (include reason)
- Booking cancelled by admin → notify booking owner
- Ticket assigned to technician → notify technician
- Ticket status changed → notify ticket reporter
- New critical ticket → notify all admins and technicians
- Facility deleted with active bookings → notify affected users

**Postconditions:** Notification is created and delivered

---

### UC-NA-08: Get Current User Profile

**Primary Actor:** User, Admin, Technician  
**Goal:** Retrieve authenticated user's profile data  
**Preconditions:** Actor is authenticated

**Main Flow:**

1. Client needs to display user info (e.g., in navbar, settings page)
2. Client sends request to GET /auth/me
3. System extracts user ID from JWT access token
4. System fetches user record from database
5. System returns user object with:
   - User ID
   - Email
   - Full name
   - Role
   - Avatar URL (if set)
   - Created date
   - Last login date
   - Preferences (if any)
6. Client stores user data in auth store/context
7. Client displays user info in UI

**Alternate Flow 8A: Token Invalid**

- 3a. JWT token is invalid or expired
- 3b. System returns HTTP 401 Unauthorized
- 3c. Client redirects to login

**Postconditions:** User profile data is returned to client

---

## Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Smart Campus Operations Hub - Use Case Diagram           │
└─────────────────────────────────────────────────────────────────────────────┘

                                ┌──────────┐
                                │  Guest   │
                                └────┬─────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────────┐ ┌───────────────┐ ┌──────────────┐
            │ UC-FA-01:     │ │ UC-FA-02:     │ │ UC-NA-01:    │
            │ Browse        │ │ View Facility │ │ Sign In      │
            │ Facilities    │ │ Details       │ │ with Google  │
            └───────────────┘ └───────────────┘ └──────────────┘


                                ┌──────────┐
                                │   User   │
                                └────┬─────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-BM-01:     │            │ UC-BM-02:     │          │ UC-BM-03:     │
│ Create        │            │ View My       │          │ Cancel Own    │
│ Booking       │            │ Bookings      │          │ Booking       │
└───────────────┘            └───────────────┘          └───────────────┘
        │
        ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-MT-01:     │            │ UC-MT-02:     │          │ UC-MT-03:     │
│ Report        │            │ View My       │          │ View Ticket   │
│ Incident      │            │ Tickets       │          │ Details       │
└───────────────┘            └───────────────┘          └───────────────┘
        │
        ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-MT-06:     │            │ UC-NA-05:     │          │ UC-NA-06:     │
│ Add Comment   │            │ View          │          │ Mark          │
│ to Ticket     │            │ Notifications │          │ Notification  │
└───────────────┘            └───────────────┘          └───────────────┘


                                ┌──────────┐
                                │  Admin   │
                                └────┬─────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-FA-03:     │            │ UC-FA-04:     │          │ UC-FA-05:     │
│ Create New    │            │ Update        │          │ Delete        │
│ Facility      │            │ Facility      │          │ Facility      │
└───────────────┘            └───────────────┘          └───────────────┘
        │
        ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-BM-04:     │            │ UC-BM-05:     │          │ UC-BM-06:     │
│ Approve       │            │ Reject        │          │ View All      │
│ Booking       │            │ Booking       │          │ Bookings      │
└───────────────┘            └───────────────┘          └───────────────┘
        │
        ▼
┌───────────────┐            ┌───────────────┐          ┌───────────────┐
│ UC-BM-07:     │            │ UC-MT-05:     │          │ UC-MT-07:     │
│ Cancel Any    │            │ Assign        │          │ View All      │
│ Booking       │            │ Technician    │          │ Tickets       │
└───────────────┘            └───────────────┘          └───────────────┘


                              ┌────────────┐
                              │ Technician │
                              └──────┬─────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────────┐ ┌───────────────┐ ┌──────────────┐
            │ UC-MT-04:     │ │ UC-MT-07:     │ │ UC-MT-01:    │
            │ Update Ticket │ │ View All      │ │ Report       │
            │ Status        │ │ Tickets       │ │ Incident     │
            └───────────────┘ └───────────────┘ └──────────────┘


                                ┌──────────┐
                                │  System  │
                                └────┬─────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                                 │
                    ▼                                 ▼
            ┌───────────────┐                 ┌──────────────┐
            │ UC-NA-07:     │                 │ Auto-expire  │
            │ Send          │                 │ Old Bookings │
            │ Notification  │                 │ (Batch Job)  │
            └───────────────┘                 └──────────────┘

```

---

## Summary

This use case document defines **26 primary use cases** across 4 modules:

- **Module A (Facilities):** 6 use cases
- **Module B (Bookings):** 7 use cases
- **Module C (Maintenance):** 7 use cases
- **Module D (Auth & Notifications):** 8 use cases

Each use case includes:

- Primary actor and goal
- Preconditions
- Main flow (success scenario)
- Alternate flows (error handling, edge cases)
- Postconditions

These use cases form the foundation for API endpoint design, database schema, and frontend UI workflows.

---

**Next Steps:**

1. Design REST API endpoints based on these use cases
2. Create PostgreSQL database schema to support all entities
3. Break down into development tasks by module and phase
