# it3030-paf-2026-smart-campus-group-PAF_WE_03_02
# Smart Campus Operations Hub
### IT3030 – Programming Applications & Frameworks | SLIIT 2026
 

A full-stack web platform built with **Spring Boot 3** and **React 18** that enables a university to manage facility bookings, asset reservations, and maintenance/incident ticketing — with role-based access and OAuth 2.0 authentication.

---

## Team

| Engineer | Name | Module | Role |
|----------|------|--------|------|
| Engineer 1 | _(Name)_ | Facilities & Assets Catalogue | Backend + Frontend |
| Engineer 2 | _(Name)_ | Booking Management | Backend + Frontend |
| Engineer 3 | _(Name)_ | Maintenance & Incident Ticketing | Backend + Frontend |
| Engineer 4 | _(Name)_ | Notifications + Auth & Authorization | Backend + Frontend |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.3, Spring Security 6, Spring Data JPA |
| Frontend | React 18, Vite, React Router v6, Axios, TanStack Query, Tailwind CSS |
| Database | MySQL 8.x |
| Auth | Google OAuth 2.0 + JWT |
| Version Control | GitHub + GitHub Actions CI |

---

## Features

- **Facilities Catalogue** — browse, search, and filter rooms/labs/equipment
- **Booking Workflow** — request → approve/reject → cancel, with conflict detection
- **Incident Ticketing** — report faults with photo evidence, track resolution
- **Notification System** — in-app notifications for all key events
- **Role-Based Access** — USER, ADMIN, TECHNICIAN roles with secured endpoints
- **Google Sign-In** — OAuth 2.0 authentication via Google

---

## Prerequisites

- Java 17+
- Node.js 20+
- MySQL 8.x
- Maven 3.9+

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-org/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX
```

### 2. Set up the database

```bash
mysql -u root -p -e "CREATE DATABASE smart_campus_db;"
mysql -u root -p smart_campus_db < schema.sql
```

### 3. Configure backend environment

Create `backend/src/main/resources/application-dev.yml` (copy from template):

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_campus_db?useSSL=false&serverTimezone=UTC
    username: YOUR_DB_USERNAME
    password: YOUR_DB_PASSWORD
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET

app:
  jwt:
    secret: your-256-bit-secret-key-here
```

> Get Google OAuth credentials: https://console.cloud.google.com  
> Redirect URI to register: `http://localhost:8080/auth/callback`

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080`

### 5. Configure frontend environment

```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 6. Run the frontend

```bash
npm install
npm run dev
```

The React app will be available at: `http://localhost:5173`

---

## API Overview

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/resources` | List all resources | Public |
| POST | `/api/v1/resources` | Create a resource | ADMIN |
| POST | `/api/v1/bookings` | Request a booking | USER |
| PUT | `/api/v1/bookings/{id}/approve` | Approve booking | ADMIN |
| POST | `/api/v1/tickets` | Report an incident | USER |
| PUT | `/api/v1/tickets/{id}/status` | Update ticket status | ADMIN/TECH |
| GET | `/api/v1/notifications` | Get notifications | Authenticated |
| GET | `/auth/me` | Get current user | Authenticated |

Full API documentation: see [`API_DOC.md`](./API_DOC.md)

---

## Project Structure

```
├── backend/          # Spring Boot REST API
├── frontend/         # React SPA
├── docs/             # Architecture diagrams, Postman collection
├── schema.sql        # Full database schema with seed data
├── API_DOC.md        # Complete API documentation
├── DEVELOPER_GUIDE.md
├── REQUIREMENTS.md
├── TASKS.md
└── ENGINEER_TASKS.md
```

---

## Running Tests

```bash
# Backend unit + integration tests
cd backend && mvn test

# View test coverage report
open target/site/jacoco/index.html
```

---

## Contributing (Branch Strategy)

```
main          ← production-ready, protected
  └─ develop  ← integration branch
       ├─ feature/module-a-[name]    (Engineer 1)
       ├─ feature/module-b-[name]    (Engineer 2)
       ├─ feature/module-c-[name]    (Engineer 3)
       └─ feature/module-d-e-[name]  (Engineer 4)
```

1. Branch from `develop` using the naming above.
2. Commit frequently with descriptive messages.
3. Open a Pull Request to `develop` when your feature is complete.
4. At least one team member must review before merging.

---

## Submission

- **Deadline:** 11:45 PM (GMT +5:30), 27th April 2026
- **Platform:** Courseweb
- **Format:** `.zip` containing source code + final report PDF
- **Exclude:** `node_modules/`, `target/`, `.env` files
- **Report name:** `IT3030_PAF_Assignment_2026_GroupXX.pdf`
