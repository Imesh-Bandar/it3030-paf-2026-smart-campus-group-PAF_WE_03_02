# Smart Campus Operations Hub — REST API Documentation

> **Project:** Smart Campus Operations Hub  
> **API Version:** v1  
> **Base URL:** `http://localhost:8080/api/v1`  
> **Authentication:** JWT Bearer Token (OAuth 2.0 Google Sign-In)  
> **Date:** March 2026

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Module A: Facilities & Assets](#module-a-facilities--assets)
5. [Module B: Booking Management](#module-b-booking-management)
6. [Module C: Maintenance & Incident Ticketing](#module-c-maintenance--incident-ticketing)
7. [Module D: Notifications](#module-d-notifications)
8. [Error Responses](#error-responses)
9. [Rate Limiting](#rate-limiting)

---

## API Overview

### Technology Stack

- **Framework:** Spring Boot 3.3
- **Security:** Spring Security 6 with OAuth 2.0 + JWT
- **Database:** PostgreSQL 14+
- **Validation:** Jakarta Bean Validation (JSR-380)
- **Documentation:** OpenAPI 3.0 (Swagger)

### API Versioning

All endpoints are versioned under `/api/v1`. Future versions will use `/api/v2`, etc.

### Base URL Structure

```
http://localhost:8080/api/v1/{resource}
```

Production:

```
https://smartcampus.yourdomain.edu/api/v1/{resource}
```

---

## Authentication

### Overview

The Smart Campus API uses Google OAuth 2.0 for user authentication and JWT (JSON Web Tokens) for session management.

### Authentication Flow

1. **Initiate Google Sign-In:** Client redirects to `GET /auth/google`
2. **OAuth Callback:** Google redirects to `GET /auth/callback` with authorization code
3. **Token Issuance:** Server returns JWT access token (1h) + refresh token (7d)
4. **API Access:** Client includes `Authorization: Bearer {access_token}` header
5. **Token Refresh:** When access token expires, client calls `POST /auth/refresh`

---

### Auth Endpoints

#### 1. Initiate Google OAuth

```http
GET /auth/google
```

**Description:** Redirects to Google OAuth consent screen

**Response:** HTTP 302 redirect to Google

---

#### 2. OAuth Callback

```http
GET /auth/callback?code={authorization_code}&state={state}
```

**Description:** Handles Google OAuth callback and issues JWT tokens

**Query Parameters:**

- `code` (string, required) - Authorization code from Google
- `state` (string, optional) - CSRF protection token

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@sliit.lk",
    "fullName": "John Doe",
    "role": "USER",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "createdAt": "2026-03-15T08:30:00Z"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "invalid_grant",
  "message": "Google authentication failed",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

#### 3. Refresh Access Token

```http
POST /auth/refresh
```

**Description:** Exchange refresh token for new access token

**Headers:**

- `Cookie: refresh_token={token}` (httpOnly cookie)

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "invalid_token",
  "message": "Refresh token expired or revoked",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

#### 4. Get Current User

```http
GET /auth/me
```

**Description:** Retrieve authenticated user's profile

**Headers:**

- `Authorization: Bearer {access_token}`

**Success Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@sliit.lk",
  "fullName": "John Doe",
  "role": "USER",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "emailVerified": true,
  "createdAt": "2026-03-15T08:30:00Z",
  "lastLoginAt": "2026-03-27T09:00:00Z"
}
```

---

#### 5. Logout

```http
POST /auth/logout
```

**Description:** Revoke refresh token and end session

**Headers:**

- `Authorization: Bearer {access_token}`
- `Cookie: refresh_token={token}`

**Success Response (204 No Content)**

---

## Common Patterns

### Pagination

All list endpoints support pagination using query parameters:

```http
GET /api/v1/resources?page=0&size=20&sort=createdAt,desc
```

**Query Parameters:**

- `page` (integer, default: 0) - Zero-indexed page number
- `size` (integer, default: 20, max: 100) - Items per page
- `sort` (string, default: varies) - Sort field and direction (e.g., `name,asc`)

**Pagination Response Structure:**

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true,
  "size": 20,
  "number": 0
}
```

---

### Filtering

Most list endpoints support filtering via query parameters:

```http
GET /api/v1/resources?type=LAB&status=AVAILABLE&capacity_min=20
```

Exact filter names are documented per endpoint.

---

### Search

Full-text search is available on select endpoints:

```http
GET /api/v1/resources?q=computer+lab
```

The `q` parameter searches across multiple fields (typically name, description).

---

### Date/Time Formats

All timestamps use ISO 8601 format:

```
2026-03-27T14:30:00Z (UTC)
2026-03-27T14:30:00+05:30 (with timezone offset)
```

Date-only parameters accept:

```
2026-03-27
```

---

## Module A: Facilities & Assets

### Endpoints Summary

| Method | Endpoint                       | Description          | Auth   |
| ------ | ------------------------------ | -------------------- | ------ |
| GET    | `/resources`                   | List all facilities  | Public |
| GET    | `/resources/{id}`              | Get facility details | Public |
| POST   | `/resources`                   | Create facility      | ADMIN  |
| PUT    | `/resources/{id}`              | Update facility      | ADMIN  |
| DELETE | `/resources/{id}`              | Delete facility      | ADMIN  |
| GET    | `/resources/{id}/availability` | Check availability   | Auth   |

---

### 1. List Facilities

```http
GET /api/v1/resources
```

**Description:** Retrieve paginated list of facilities with filtering and search

**Authentication:** None (public access)

**Query Parameters:**

- `page` (integer, default: 0)
- `size` (integer, default: 20, max: 100)
- `sort` (string, default: `name,asc`)
- `type` (string, optional) - Filter by type: `LAB`, `CLASSROOM`, `HALL`, `EQUIPMENT`, `SPORTS_FACILITY`
- `status` (string, optional) - Filter by status: `AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`
- `capacity_min` (integer, optional) - Minimum capacity
- `capacity_max` (integer, optional) - Maximum capacity
- `q` (string, optional) - Full-text search on name and description

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Computer Lab 3A",
      "type": "LAB",
      "capacity": 40,
      "status": "AVAILABLE",
      "location": "IT Building - Floor 3, Room 3A",
      "description": "Advanced computer lab with 40 workstations, projector, and whiteboard",
      "thumbnailUrl": "https://cdn.smartcampus.edu/images/labs/3a-thumb.jpg",
      "amenities": ["WiFi", "Projector", "Air Conditioning", "Whiteboard"],
      "createdAt": "2025-09-01T10:00:00Z",
      "updatedAt": "2026-03-15T08:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true }
  },
  "totalElements": 85,
  "totalPages": 5,
  "last": false,
  "first": true
}
```

---

### 2. Get Facility Details

```http
GET /api/v1/resources/{id}
```

**Description:** Retrieve detailed information about a specific facility

**Authentication:** None (public access)

**Path Parameters:**

- `id` (UUID, required) - Facility ID

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Computer Lab 3A",
  "type": "LAB",
  "capacity": 40,
  "status": "AVAILABLE",
  "location": "IT Building - Floor 3, Room 3A",
  "description": "Advanced computer lab with 40 workstations, high-performance PCs with Intel Core i7, 16GB RAM, dual monitors. Equipped with smartboard, projector, and climate control.",
  "images": [
    {
      "url": "https://cdn.smartcampus.edu/images/labs/3a-1.jpg",
      "caption": "Main view of Computer Lab 3A",
      "isPrimary": true
    },
    {
      "url": "https://cdn.smartcampus.edu/images/labs/3a-2.jpg",
      "caption": "Workstation close-up",
      "isPrimary": false
    }
  ],
  "amenities": ["WiFi", "Projector", "Air Conditioning", "Whiteboard", "Smart Board"],
  "specifications": {
    "workstations": 40,
    "software": ["Visual Studio", "IntelliJ IDEA", "MySQL Workbench", "Git"],
    "hardware": "Intel Core i7, 16GB RAM, 512GB SSD, Dual 24-inch monitors"
  },
  "availability": {
    "isAvailableNow": true,
    "nextAvailableSlot": "2026-03-27T14:00:00Z",
    "nextBooking": null
  },
  "createdAt": "2025-09-01T10:00:00Z",
  "updatedAt": "2026-03-15T08:30:00Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Facility with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 3. Create Facility

```http
POST /api/v1/resources
```

**Description:** Create a new facility (Admin only)

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Request Body:**

```json
{
  "name": "Physics Laboratory 2B",
  "type": "LAB",
  "capacity": 30,
  "location": "Science Building - Floor 2, Room 2B",
  "description": "Well-equipped physics lab for undergraduate experiments",
  "amenities": ["Safety Equipment", "Fume Hood", "Lab Benches"],
  "specifications": {
    "equipment": ["Oscilloscopes", "Multimeters", "Power Supplies"],
    "storage": "Chemical storage cabinet"
  }
}
```

**Field Validations:**

- `name` (string, required, 3-100 chars) - Unique facility name
- `type` (enum, required) - One of: `LAB`, `CLASSROOM`, `HALL`, `EQUIPMENT`, `SPORTS_FACILITY`
- `capacity` (integer, required, min: 1, max: 1000) - Maximum occupancy
- `location` (string, required, 5-200 chars) - Physical location
- `description` (string, optional, max: 1000 chars)
- `amenities` (array of strings, optional) - List of amenities
- `specifications` (object, optional) - Free-form JSON object

**Success Response (201 Created):**

```json
{
  "id": "660f9511-f39c-52e5-b827-557766551111",
  "name": "Physics Laboratory 2B",
  "type": "LAB",
  "capacity": 30,
  "status": "AVAILABLE",
  "location": "Science Building - Floor 2, Room 2B",
  "description": "Well-equipped physics lab for undergraduate experiments",
  "amenities": ["Safety Equipment", "Fume Hood", "Lab Benches"],
  "specifications": {
    "equipment": ["Oscilloscopes", "Multimeters", "Power Supplies"],
    "storage": "Chemical storage cabinet"
  },
  "createdAt": "2026-03-27T10:30:00Z",
  "updatedAt": "2026-03-27T10:30:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed for request body",
  "errors": [
    {
      "field": "name",
      "message": "Name must be between 3 and 100 characters"
    },
    {
      "field": "capacity",
      "message": "Capacity must be between 1 and 1000"
    }
  ],
  "timestamp": "2026-03-27T10:15:30Z"
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions. ADMIN role required.",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 4. Update Facility

```http
PUT /api/v1/resources/{id}
```

**Description:** Update facility information (Admin only)

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Path Parameters:**

- `id` (UUID, required) - Facility ID

**Request Body:**

```json
{
  "name": "Computer Lab 3A (Upgraded)",
  "capacity": 45,
  "status": "AVAILABLE",
  "description": "Recently upgraded with new workstations",
  "amenities": [
    "WiFi",
    "Projector",
    "Air Conditioning",
    "Whiteboard",
    "Smart Board",
    "Document Camera"
  ]
}
```

**Field Validations:** Same as Create Facility (all fields optional)

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Computer Lab 3A (Upgraded)",
  "type": "LAB",
  "capacity": 45,
  "status": "AVAILABLE",
  "location": "IT Building - Floor 3, Room 3A",
  "description": "Recently upgraded with new workstations",
  "amenities": [
    "WiFi",
    "Projector",
    "Air Conditioning",
    "Whiteboard",
    "Smart Board",
    "Document Camera"
  ],
  "updatedAt": "2026-03-27T11:00:00Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Facility with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 5. Delete Facility

```http
DELETE /api/v1/resources/{id}
```

**Description:** Soft-delete a facility (Admin only). Fails if active bookings exist.

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Path Parameters:**

- `id` (UUID, required) - Facility ID

**Success Response (204 No Content)**

**Error Response (409 Conflict):**

```json
{
  "error": "CONFLICT",
  "message": "Cannot delete facility with active bookings. Cancel all bookings first.",
  "conflictingBookings": [
    {
      "id": "770g0622-g40d-63f6-c938-668877662222",
      "userId": "user-123",
      "startTime": "2026-03-28T09:00:00Z",
      "endTime": "2026-03-28T11:00:00Z",
      "status": "CONFIRMED"
    }
  ],
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 6. Check Availability

```http
GET /api/v1/resources/{id}/availability
```

**Description:** Get availability time slots for a facility within a date range

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (UUID, required) - Facility ID

**Query Parameters:**

- `from` (ISO date, required) - Start date (e.g., `2026-03-27`)
- `to` (ISO date, required) - End date (max 90 days from `from`)

**Success Response (200 OK):**

```json
{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "resourceName": "Computer Lab 3A",
  "period": {
    "from": "2026-03-27",
    "to": "2026-03-28"
  },
  "availability": [
    {
      "date": "2026-03-27",
      "slots": [
        {
          "startTime": "08:00",
          "endTime": "09:00",
          "status": "AVAILABLE"
        },
        {
          "startTime": "09:00",
          "endTime": "11:00",
          "status": "OCCUPIED",
          "bookingId": "booking-456",
          "bookedBy": "John Doe"
        },
        {
          "startTime": "11:00",
          "endTime": "13:00",
          "status": "AVAILABLE"
        }
      ]
    },
    {
      "date": "2026-03-28",
      "slots": [
        {
          "startTime": "08:00",
          "endTime": "17:00",
          "status": "AVAILABLE"
        }
      ]
    }
  ]
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "'to' date must be within 90 days of 'from' date",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

## Module B: Booking Management

### Endpoints Summary

| Method | Endpoint                 | Description            | Auth       |
| ------ | ------------------------ | ---------------------- | ---------- |
| POST   | `/bookings`              | Create booking request | USER       |
| GET    | `/bookings`              | List own bookings      | USER       |
| GET    | `/bookings/{id}`         | Get booking details    | USER/ADMIN |
| PUT    | `/bookings/{id}/cancel`  | Cancel booking         | USER/ADMIN |
| GET    | `/bookings/all`          | List all bookings      | ADMIN      |
| PUT    | `/bookings/{id}/approve` | Approve booking        | ADMIN      |
| PUT    | `/bookings/{id}/reject`  | Reject booking         | ADMIN      |

---

### 1. Create Booking

```http
POST /api/v1/bookings
```

**Description:** Request to book a facility

**Authentication:** Required (Bearer token)  
**Role:** USER, ADMIN

**Request Body:**

```json
{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2026-03-28T09:00:00Z",
  "endTime": "2026-03-28T11:00:00Z",
  "purpose": "Machine Learning practical session for IT3030 class"
}
```

**Field Validations:**

- `resourceId` (UUID, required) - Must reference existing facility
- `startTime` (ISO datetime, required) - Must be in future, minimum 1 day ahead
- `endTime` (ISO datetime, required) - Must be after startTime
- `purpose` (string, required, 10-500 chars) - Reason for booking
- Duration must be between 30 minutes and 8 hours

**Success Response (201 Created):**

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "resourceName": "Computer Lab 3A",
  "userId": "user-123",
  "userName": "John Doe",
  "userEmail": "john.doe@sliit.lk",
  "startTime": "2026-03-28T09:00:00Z",
  "endTime": "2026-03-28T11:00:00Z",
  "purpose": "Machine Learning practical session for IT3030 class",
  "status": "PENDING",
  "createdAt": "2026-03-27T10:30:00Z"
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "BOOKING_CONFLICT",
  "message": "Requested time slot conflicts with an existing booking",
  "conflictingBooking": {
    "id": "existing-booking-789",
    "startTime": "2026-03-28T08:30:00Z",
    "endTime": "2026-03-28T10:30:00Z",
    "status": "CONFIRMED"
  },
  "suggestions": [
    {
      "startTime": "2026-03-28T11:00:00Z",
      "endTime": "2026-03-28T13:00:00Z"
    },
    {
      "startTime": "2026-03-28T14:00:00Z",
      "endTime": "2026-03-28T16:00:00Z"
    }
  ],
  "timestamp": "2026-03-27T10:15:30Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed for request body",
  "errors": [
    {
      "field": "startTime",
      "message": "Start time must be at least 24 hours in the future"
    },
    {
      "field": "duration",
      "message": "Booking duration must be between 30 minutes and 8 hours"
    }
  ],
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 2. List Own Bookings

```http
GET /api/v1/bookings
```

**Description:** Retrieve authenticated user's bookings

**Authentication:** Required (Bearer token)  
**Role:** USER, ADMIN, TECHNICIAN

**Query Parameters:**

- `page` (integer, default: 0)
- `size` (integer, default: 20)
- `sort` (string, default: `startTime,desc`)
- `status` (string, optional) - Filter: `PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`, `COMPLETED`
- `from` (ISO date, optional) - Filter bookings starting from date
- `to` (ISO date, optional) - Filter bookings until date

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "880h1733-h51e-74g7-d049-779988773333",
      "resourceId": "550e8400-e29b-41d4-a716-446655440000",
      "resourceName": "Computer Lab 3A",
      "resourceType": "LAB",
      "startTime": "2026-03-28T09:00:00Z",
      "endTime": "2026-03-28T11:00:00Z",
      "purpose": "Machine Learning practical session",
      "status": "PENDING",
      "createdAt": "2026-03-27T10:30:00Z",
      "canCancel": true,
      "canModify": false
    }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 12,
  "totalPages": 1
}
```

---

### 3. Get Booking Details

```http
GET /api/v1/bookings/{id}
```

**Description:** Retrieve detailed information about a booking

**Authentication:** Required (Bearer token)  
**Access:** Owner or ADMIN

**Path Parameters:**

- `id` (UUID, required) - Booking ID

**Success Response (200 OK):**

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "resource": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Computer Lab 3A",
    "type": "LAB",
    "capacity": 40,
    "location": "IT Building - Floor 3, Room 3A",
    "thumbnailUrl": "https://cdn.smartcampus.edu/images/labs/3a-thumb.jpg"
  },
  "user": {
    "id": "user-123",
    "fullName": "John Doe",
    "email": "john.doe@sliit.lk"
  },
  "startTime": "2026-03-28T09:00:00Z",
  "endTime": "2026-03-28T11:00:00Z",
  "purpose": "Machine Learning practical session for IT3030 class",
  "status": "PENDING",
  "statusHistory": [
    {
      "status": "PENDING",
      "timestamp": "2026-03-27T10:30:00Z",
      "changedBy": "John Doe",
      "notes": "Booking request submitted"
    }
  ],
  "createdAt": "2026-03-27T10:30:00Z",
  "updatedAt": "2026-03-27T10:30:00Z",
  "canCancel": true,
  "canApprove": false,
  "canReject": false
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to view this booking",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 4. Cancel Booking

```http
PUT /api/v1/bookings/{id}/cancel
```

**Description:** Cancel a booking (owner or admin)

**Authentication:** Required (Bearer token)  
**Access:** Booking owner or ADMIN

**Path Parameters:**

- `id` (UUID, required) - Booking ID

**Request Body (optional for owner, required for admin):**

```json
{
  "reason": "Emergency facility maintenance required"
}
```

**Success Response (200 OK):**

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "status": "CANCELLED",
  "cancelledBy": "user-123",
  "cancellationReason": "User initiated cancellation",
  "cancelledAt": "2026-03-27T11:00:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "INVALID_OPERATION",
  "message": "Cannot cancel a booking that has already started",
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

### 5. List All Bookings (Admin)

```http
GET /api/v1/bookings/all
```

**Description:** Retrieve all bookings across the system

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Query Parameters:**

- `page` (integer, default: 0)
- `size` (integer, default: 20)
- `sort` (string, default: `createdAt,desc`)
- `status` (string, optional) - Filter by status
- `resourceId` (UUID, optional) - Filter by facility
- `userId` (UUID, optional) - Filter by user
- `from` (ISO date, optional) - Filter by date range
- `to` (ISO date, optional)

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "880h1733-h51e-74g7-d049-779988773333",
      "resourceName": "Computer Lab 3A",
      "userName": "John Doe",
      "userEmail": "john.doe@sliit.lk",
      "startTime": "2026-03-28T09:00:00Z",
      "endTime": "2026-03-28T11:00:00Z",
      "purpose": "Machine Learning practical",
      "status": "PENDING",
      "createdAt": "2026-03-27T10:30:00Z"
    }
  ],
  "totalElements": 248,
  "totalPages": 13
}
```

---

### 6. Approve Booking

```http
PUT /api/v1/bookings/{id}/approve
```

**Description:** Approve a pending booking

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Path Parameters:**

- `id` (UUID, required) - Booking ID

**Success Response (200 OK):**

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "status": "CONFIRMED",
  "approvedBy": "admin-user-456",
  "approvedAt": "2026-03-27T12:00:00Z",
  "message": "Booking approved successfully. Confirmation email sent to user."
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "BOOKING_CONFLICT",
  "message": "Cannot approve. Another booking was confirmed for this time slot.",
  "conflictingBooking": {
    "id": "booking-999",
    "startTime": "2026-03-28T08:30:00Z",
    "endTime": "2026-03-28T10:30:00Z",
    "approvedAt": "2026-03-27T11:45:00Z"
  },
  "timestamp": "2026-03-27T12:00:00Z"
}
```

---

### 7. Reject Booking

```http
PUT /api/v1/bookings/{id}/reject
```

**Description:** Reject a pending booking with reason

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Path Parameters:**

- `id` (UUID, required) - Booking ID

**Request Body:**

```json
{
  "reason": "Facility scheduled for maintenance during requested time"
}
```

**Field Validations:**

- `reason` (string, required, 10-500 chars)

**Success Response (200 OK):**

```json
{
  "id": "880h1733-h51e-74g7-d049-779988773333",
  "status": "REJECTED",
  "rejectedBy": "admin-user-456",
  "rejectionReason": "Facility scheduled for maintenance during requested time",
  "rejectedAt": "2026-03-27T12:00:00Z",
  "message": "Booking rejected. User has been notified."
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Rejection reason is required",
  "timestamp": "2026-03-27T12:00:00Z"
}
```

---

## Module C: Maintenance & Incident Ticketing

### Endpoints Summary

| Method | Endpoint                 | Description        | Auth             |
| ------ | ------------------------ | ------------------ | ---------------- |
| POST   | `/tickets`               | Report incident    | USER/ADMIN/TECH  |
| POST   | `/tickets/evidence`      | Upload evidence    | USER/ADMIN/TECH  |
| GET    | `/tickets`               | List tickets       | USER/ADMIN/TECH  |
| GET    | `/tickets/{id}`          | Get ticket details | Owner/ADMIN/TECH |
| PUT    | `/tickets/{id}/status`   | Update status      | ADMIN/TECH       |
| PUT    | `/tickets/{id}/assign`   | Assign technician  | ADMIN            |
| POST   | `/tickets/{id}/comments` | Add comment        | Owner/ADMIN/TECH |

---

### 1. Report Incident

```http
POST /api/v1/tickets
```

**Description:** Create a new maintenance or incident ticket

**Authentication:** Required (Bearer token)  
**Role:** USER, ADMIN, TECHNICIAN

**Request Body:**

```json
{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Projector not working in Lab 3A",
  "description": "The main projector in Computer Lab 3A is not turning on. Tried power cycling but no response. Needs urgent attention as we have a lab session tomorrow.",
  "severity": "HIGH",
  "category": "EQUIPMENT"
}
```

**Field Validations:**

- `resourceId` (UUID, required) - Facility where issue occurred
- `title` (string, required, 5-100 chars) - Brief issue summary
- `description` (string, required, 20-1000 chars) - Detailed description
- `severity` (enum, required) - One of: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `category` (enum, required) - One of: `ELECTRICAL`, `PLUMBING`, `EQUIPMENT`, `CLEANING`, `OTHER`

**Success Response (201 Created):**

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "ticketNumber": "TICK-20260327-0012",
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "resourceName": "Computer Lab 3A",
  "reporterId": "user-123",
  "reporterName": "John Doe",
  "reporterEmail": "john.doe@sliit.lk",
  "title": "Projector not working in Lab 3A",
  "description": "The main projector in Computer Lab 3A is not turning on...",
  "severity": "HIGH",
  "category": "EQUIPMENT",
  "status": "OPEN",
  "assignedTo": null,
  "createdAt": "2026-03-27T14:30:00Z"
}
```

---

### 2. Upload Evidence

```http
POST /api/v1/tickets/evidence
```

**Description:** Upload photo evidence for a ticket

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Form Fields:**

- `ticketId` (UUID, required) - Ticket ID
- `file` (file, required) - Image file (JPEG/PNG, max 5MB)

**Success Response (200 OK):**

```json
{
  "ticketId": "990i2844-i62f-85h8-e150-880099884444",
  "evidenceUrl": "https://cdn.smartcampus.edu/tickets/990i2844/evidence-1.jpg",
  "uploadedAt": "2026-03-27T14:35:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "INVALID_FILE",
  "message": "File size exceeds maximum allowed size of 5MB",
  "timestamp": "2026-03-27T14:35:00Z"
}
```

---

### 3. List Tickets

```http
GET /api/v1/tickets
```

**Description:** List tickets (scope depends on role)

- USER: Only own tickets
- TECHNICIAN: Only assigned tickets
- ADMIN: All tickets

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (integer, default: 0)
- `size` (integer, default: 20)
- `sort` (string, default: `createdAt,desc`)
- `status` (string, optional) - Filter: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- `severity` (string, optional) - Filter: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- `category` (string, optional)
- `resourceId` (UUID, optional) - Filter by facility
- `assignedTo` (UUID, optional) - Filter by technician (ADMIN only)

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "990i2844-i62f-85h8-e150-880099884444",
      "ticketNumber": "TICK-20260327-0012",
      "resourceName": "Computer Lab 3A",
      "title": "Projector not working in Lab 3A",
      "severity": "HIGH",
      "category": "EQUIPMENT",
      "status": "OPEN",
      "reporterName": "John Doe",
      "assignedTo": null,
      "createdAt": "2026-03-27T14:30:00Z",
      "updatedAt": "2026-03-27T14:30:00Z"
    }
  ],
  "totalElements": 34,
  "totalPages": 2
}
```

---

### 4. Get Ticket Details

```http
GET /api/v1/tickets/{id}
```

**Description:** Retrieve full ticket details including comments and history

**Authentication:** Required (Bearer token)  
**Access:** Reporter, ADMIN, or assigned TECHNICIAN

**Path Parameters:**

- `id` (UUID, required) - Ticket ID

**Success Response (200 OK):**

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "ticketNumber": "TICK-20260327-0012",
  "resource": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Computer Lab 3A",
    "type": "LAB",
    "location": "IT Building - Floor 3, Room 3A"
  },
  "reporter": {
    "id": "user-123",
    "fullName": "John Doe",
    "email": "john.doe@sliit.lk"
  },
  "assignedTechnician": {
    "id": "tech-789",
    "fullName": "Mike Wilson",
    "email": "mike.wilson@sliit.lk"
  },
  "title": "Projector not working in Lab 3A",
  "description": "The main projector in Computer Lab 3A is not turning on...",
  "severity": "HIGH",
  "category": "EQUIPMENT",
  "status": "IN_PROGRESS",
  "evidence": [
    {
      "url": "https://cdn.smartcampus.edu/tickets/990i2844/evidence-1.jpg",
      "uploadedAt": "2026-03-27T14:35:00Z"
    }
  ],
  "comments": [
    {
      "id": "comment-1",
      "userId": "tech-789",
      "userName": "Mike Wilson",
      "text": "I've checked the projector. The bulb needs replacement. Will install new bulb tomorrow morning.",
      "createdAt": "2026-03-27T15:00:00Z"
    }
  ],
  "statusHistory": [
    {
      "status": "OPEN",
      "timestamp": "2026-03-27T14:30:00Z",
      "changedBy": "John Doe",
      "notes": "Ticket created"
    },
    {
      "status": "IN_PROGRESS",
      "timestamp": "2026-03-27T15:00:00Z",
      "changedBy": "Mike Wilson",
      "notes": "Started investigation"
    }
  ],
  "createdAt": "2026-03-27T14:30:00Z",
  "updatedAt": "2026-03-27T15:00:00Z"
}
```

---

### 5. Update Ticket Status

```http
PUT /api/v1/tickets/{id}/status
```

**Description:** Change ticket status (ADMIN or assigned TECHNICIAN only)

**Authentication:** Required (Bearer token)  
**Role:** ADMIN or assigned TECHNICIAN

**Path Parameters:**

- `id` (UUID, required) - Ticket ID

**Request Body:**

```json
{
  "status": "IN_PROGRESS",
  "notes": "Diagnosed the issue. Bulb replacement needed."
}
```

**Field Validations:**

- `status` (enum, required) - One of: `OPEN`, `IN_PROGRESS`, `RESOLVED`
- `notes` (string, optional, max 500 chars) - Status change explanation

**Status Transitions:**

- `OPEN` → `IN_PROGRESS` (when technician starts work)
- `IN_PROGRESS` → `RESOLVED` (when issue is fixed)
- Cannot transition backward from `RESOLVED`

**Success Response (200 OK):**

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "status": "IN_PROGRESS",
  "updatedBy": "tech-789",
  "updatedAt": "2026-03-27T15:00:00Z",
  "notes": "Diagnosed the issue. Bulb replacement needed."
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "INVALID_STATUS_TRANSITION",
  "message": "Cannot change status from RESOLVED to OPEN. Create a new ticket instead.",
  "timestamp": "2026-03-27T15:00:00Z"
}
```

---

### 6. Assign Technician

```http
PUT /api/v1/tickets/{id}/assign
```

**Description:** Assign a technician to a ticket (ADMIN only)

**Authentication:** Required (Bearer token)  
**Role:** ADMIN

**Path Parameters:**

- `id` (UUID, required) - Ticket ID

**Request Body:**

```json
{
  "technicianId": "tech-789"
}
```

**Field Validations:**

- `technicianId` (UUID, required) - Must reference a user with TECHNICIAN role

**Success Response (200 OK):**

```json
{
  "id": "990i2844-i62f-85h8-e150-880099884444",
  "assignedTo": {
    "id": "tech-789",
    "fullName": "Mike Wilson",
    "email": "mike.wilson@sliit.lk"
  },
  "assignedBy": "admin-user-456",
  "assignedAt": "2026-03-27T14:45:00Z",
  "message": "Technician assigned successfully. Notification sent."
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "INVALID_ROLE",
  "message": "User tech-789 does not have TECHNICIAN role",
  "timestamp": "2026-03-27T14:45:00Z"
}
```

---

### 7. Add Comment

```http
POST /api/v1/tickets/{id}/comments
```

**Description:** Add a comment to a ticket thread

**Authentication:** Required (Bearer token)  
**Access:** Reporter, ADMIN, or assigned TECHNICIAN

**Path Parameters:**

- `id` (UUID, required) - Ticket ID

**Request Body:**

```json
{
  "text": "I've installed a new bulb and tested the projector. Everything is working now."
}
```

**Field Validations:**

- `text` (string, required, 5-500 chars) - Comment content

**Success Response (201 Created):**

```json
{
  "id": "comment-2",
  "ticketId": "990i2844-i62f-85h8-e150-880099884444",
  "userId": "tech-789",
  "userName": "Mike Wilson",
  "text": "I've installed a new bulb and tested the projector. Everything is working now.",
  "createdAt": "2026-03-28T09:00:00Z"
}
```

---

## Module D: Notifications

### Endpoints Summary

| Method | Endpoint                   | Description         | Auth |
| ------ | -------------------------- | ------------------- | ---- |
| GET    | `/notifications`           | List notifications  | Auth |
| PUT    | `/notifications/read-all`  | Mark all as read    | Auth |
| PUT    | `/notifications/{id}/read` | Mark single as read | Auth |

---

### 1. List Notifications

```http
GET /api/v1/notifications
```

**Description:** Retrieve authenticated user's notifications

**Authentication:** Required (Bearer token)

**Query Parameters:**

- `page` (integer, default: 0)
- `size` (integer, default: 20, max: 100)
- `read` (boolean, optional) - Filter by read status (true/false)

**Success Response (200 OK):**

```json
{
  "content": [
    {
      "id": "notif-001",
      "type": "BOOKING",
      "title": "Booking Approved",
      "message": "Your booking for Computer Lab 3A on March 28 has been approved.",
      "entityType": "BOOKING",
      "entityId": "880h1733-h51e-74g7-d049-779988773333",
      "isRead": false,
      "createdAt": "2026-03-27T12:00:00Z"
    },
    {
      "id": "notif-002",
      "type": "TICKET",
      "title": "Ticket Updated",
      "message": "Your ticket TICK-20260327-0012 status changed to IN_PROGRESS",
      "entityType": "TICKET",
      "entityId": "990i2844-i62f-85h8-e150-880099884444",
      "isRead": false,
      "createdAt": "2026-03-27T15:00:00Z"
    }
  ],
  "totalElements": 18,
  "totalPages": 1,
  "unreadCount": 5
}
```

---

### 2. Mark All Notifications as Read

```http
PUT /api/v1/notifications/read-all
```

**Description:** Mark all user's notifications as read

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**

```json
{
  "updatedCount": 5,
  "message": "All notifications marked as read"
}
```

---

### 3. Mark Single Notification as Read

```http
PUT /api/v1/notifications/{id}/read
```

**Description:** Mark a specific notification as read

**Authentication:** Required (Bearer token)

**Path Parameters:**

- `id` (UUID, required) - Notification ID

**Success Response (200 OK):**

```json
{
  "id": "notif-001",
  "isRead": true,
  "readAt": "2026-03-27T16:00:00Z"
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "2026-03-27T10:15:30Z",
  "path": "/api/v1/resources/invalid-id",
  "details": {}
}
```

### Common HTTP Status Codes

| Code | Name                  | Description                                     |
| ---- | --------------------- | ----------------------------------------------- |
| 400  | Bad Request           | Invalid input, validation failed                |
| 401  | Unauthorized          | Missing or invalid JWT token                    |
| 403  | Forbidden             | Insufficient permissions for resource           |
| 404  | Not Found             | Resource does not exist                         |
| 409  | Conflict              | Business logic conflict (e.g., booking overlap) |
| 422  | Unprocessable Entity  | Semantic validation error                       |
| 429  | Too Many Requests     | Rate limit exceeded                             |
| 500  | Internal Server Error | Unexpected server error                         |

### Error Codes

| Code                        | HTTP | Description              |
| --------------------------- | ---- | ------------------------ |
| `VALIDATION_ERROR`          | 400  | Input validation failed  |
| `UNAUTHORIZED`              | 401  | Authentication required  |
| `FORBIDDEN`                 | 403  | Insufficient permissions |
| `RESOURCE_NOT_FOUND`        | 404  | Entity not found         |
| `BOOKING_CONFLICT`          | 409  | Time slot conflict       |
| `INVALID_STATUS_TRANSITION` | 400  | Illegal state change     |
| `INVALID_FILE`              | 400  | File upload error        |
| `RATE_LIMIT_EXCEEDED`       | 429  | Too many requests        |

---

## Rate Limiting

### Limits by Endpoint Type

| Endpoint            | Rate Limit   | Window     |
| ------------------- | ------------ | ---------- |
| `/auth/*`           | 5 requests   | 15 minutes |
| `/resources` (GET)  | 100 requests | 1 minute   |
| `/bookings` (POST)  | 10 requests  | 1 hour     |
| `/tickets` (POST)   | 20 requests  | 1 hour     |
| All other endpoints | 60 requests  | 1 minute   |

### Rate Limit Headers

Responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1680000000
```

### Rate Limit Exceeded Response (429)

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 45 seconds.",
  "retryAfter": 45,
  "timestamp": "2026-03-27T10:15:30Z"
}
```

---

## Appendix: Data Models

### Resource (Facility)

```json
{
  "id": "UUID",
  "name": "string",
  "type": "LAB | CLASSROOM | HALL | EQUIPMENT | SPORTS_FACILITY",
  "capacity": "integer",
  "status": "AVAILABLE | OCCUPIED | UNDER_MAINTENANCE",
  "location": "string",
  "description": "string",
  "images": [{ "url": "string", "caption": "string", "isPrimary": "boolean" }],
  "amenities": ["string"],
  "specifications": {},
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "deletedAt": "ISO datetime | null"
}
```

### Booking

```json
{
  "id": "UUID",
  "resourceId": "UUID",
  "userId": "UUID",
  "startTime": "ISO datetime",
  "endTime": "ISO datetime",
  "purpose": "string",
  "status": "PENDING | CONFIRMED | CANCELLED | REJECTED | COMPLETED",
  "cancellationReason": "string | null",
  "rejectionReason": "string | null",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Ticket

```json
{
  "id": "UUID",
  "ticketNumber": "string",
  "resourceId": "UUID",
  "reporterId": "UUID",
  "assignedTo": "UUID | null",
  "title": "string",
  "description": "string",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "category": "ELECTRICAL | PLUMBING | EQUIPMENT | CLEANING | OTHER",
  "status": "OPEN | IN_PROGRESS | RESOLVED",
  "evidence": [{ "url": "string", "uploadedAt": "ISO datetime" }],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

### Notification

```json
{
  "id": "UUID",
  "userId": "UUID",
  "type": "BOOKING | TICKET | SYSTEM",
  "title": "string",
  "message": "string",
  "entityType": "BOOKING | TICKET | RESOURCE",
  "entityId": "UUID",
  "isRead": "boolean",
  "readAt": "ISO datetime | null",
  "createdAt": "ISO datetime"
}
```

---

**End of API Documentation**
