<div align="center">

# Smart Campus Operations Hub

**Full-stack campus operations platform for facilities, bookings, maintenance tickets, notifications, and secure role-based administration.**

Built for **SLIIT IT3030 PAF 2026** by **Group PAF_WE_03_02**.

<br />

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.12-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Tokens-111827?style=flat-square&logo=jsonwebtokens&logoColor=white)
![OAuth](https://img.shields.io/badge/OAuth-Google-4285F4?style=flat-square&logo=google&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Academic-yellow?style=flat-square)

[Features](#features) | [Architecture](#architecture) | [Tech Stack](#tech-stack) | [Folder Structure](#folder-structure) | [How to Run](#how-to-run) | [API Endpoints](#api-endpoints) | [Database](#database) | [Docs](#documentation)

</div>

---

## Features

| Module                   | Main Features                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Facilities and Resources | Resource catalogue, search/filtering, availability windows, maintenance blackouts, availability calendar |
| Booking Management       | Booking requests, conflict preview, alternative slots, waitlist, approval/rejection, QR check-in         |
| Maintenance Tickets      | Incident tickets, image evidence upload, comments, internal notes, SLA tracking, technician workload     |
| Auth and Notifications   | JWT auth, refresh tokens, Google OAuth, role-based access, notifications, preferences, security logs     |

## Architecture

The system uses a standard three-layer web architecture:

1. **Frontend**: React/Vite single-page app.
2. **Backend**: Spring Boot REST API.
3. **Database**: PostgreSQL database accessed only through backend repositories.

The frontend never connects directly to the database.

### Request Flow

| Step | Layer                  | Responsibility                          | Main Location                                                                                                   |
| ---- | ---------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | React page/component   | User interface and form interactions    | `frontend/src/app/`, `frontend/src/components/`                                                                 |
| 2    | Hook/store/API service | Client state and API call preparation   | `frontend/src/hooks/`, `frontend/src/stores/`, `frontend/src/services/api/`                                     |
| 3    | Axios client           | Base URL, JWT attachment, token refresh | `frontend/src/lib/axios.ts`                                                                                     |
| 4    | Controller             | Receives HTTP requests                  | `backend/src/main/java/edu/sliit/smartcampus/controller/`                                                       |
| 5    | Service                | Business rules and validation           | `backend/src/main/java/edu/sliit/smartcampus/service/`                                                          |
| 6    | Repository/entity      | Database access through JPA             | `backend/src/main/java/edu/sliit/smartcampus/repository/`, `backend/src/main/java/edu/sliit/smartcampus/model/` |
| 7    | Database               | Persistent data storage                 | `backend/db/full_schemas.sql`                                                                                   |

### Data Flow

```text
React UI
  -> API service
  -> Axios client with JWT
  -> Spring Boot controller
  -> Service layer
  -> Repository layer
  -> JPA entity
  -> PostgreSQL table
```

### Security Flow

| Area             | How It Works                                                  |
| ---------------- | ------------------------------------------------------------- |
| Login            | User logs in through `/api/v1/auth/login` and receives tokens |
| API access       | Axios sends `Authorization: Bearer <accessToken>`             |
| Token refresh    | Axios calls `/api/v1/auth/refresh` when access token expires  |
| Backend security | Spring Security validates JWT and role permissions            |
| Role-based UI    | React navigation and routes are filtered by user role         |

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-1.14-5A29E4?style=flat-square)
![Zustand](https://img.shields.io/badge/Zustand-State%20Store-443E38?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-Icons-111827?style=flat-square)

### Backend

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.12-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-Springdoc-85EA2D?style=flat-square&logo=openapiinitiative&logoColor=black)
![Lombok](https://img.shields.io/badge/Lombok-Annotations-BC4521?style=flat-square)

### Database and Tooling

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![H2](https://img.shields.io/badge/H2-Test%20Database-0B5CAD?style=flat-square)
![npm](https://img.shields.io/badge/npm-Workspaces-CB3837?style=flat-square&logo=npm&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=flat-square&logo=prettier&logoColor=black)
![Husky](https://img.shields.io/badge/Husky-Git%20Hooks-111827?style=flat-square)
![Maven](https://img.shields.io/badge/Maven-Wrapper-C71A36?style=flat-square&logo=apachemaven&logoColor=white)

## Folder Structure

### Main Folders

| Path           | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `backend/`     | Spring Boot REST API                                              |
| `frontend/`    | React/Vite frontend application                                   |
| `docs/`        | API docs, ERD, database docs, data flow guide, Postman collection |
| `.husky/`      | Git pre-commit hooks                                              |
| `package.json` | Root npm workspace scripts                                        |

### Backend Folders

| Path                                                      | Purpose                            |
| --------------------------------------------------------- | ---------------------------------- |
| `backend/src/main/java/edu/sliit/smartcampus/controller/` | REST API controllers               |
| `backend/src/main/java/edu/sliit/smartcampus/service/`    | Business logic and validation      |
| `backend/src/main/java/edu/sliit/smartcampus/repository/` | Spring Data JPA repositories       |
| `backend/src/main/java/edu/sliit/smartcampus/model/`      | JPA entities and enums             |
| `backend/src/main/java/edu/sliit/smartcampus/dto/`        | Request and response DTOs          |
| `backend/src/main/java/edu/sliit/smartcampus/security/`   | JWT and OAuth security code        |
| `backend/src/main/resources/application.yml`              | Backend profiles and configuration |
| `backend/db/full_schemas.sql`                             | Full PostgreSQL schema             |

### Frontend Folders

| Path                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `frontend/src/app/`            | Route-level pages                     |
| `frontend/src/components/`     | Reusable UI components                |
| `frontend/src/hooks/`          | Custom hooks and TanStack Query hooks |
| `frontend/src/services/api/`   | Axios API functions                   |
| `frontend/src/services/types/` | TypeScript API types                  |
| `frontend/src/stores/`         | Zustand stores                        |
| `frontend/src/lib/axios.ts`    | Shared Axios client                   |
| `frontend/src/index.css`       | Global design system styles           |

## How to Run

### Prerequisites

| Tool       | Version       |
| ---------- | ------------- |
| Java       | 17            |
| Node.js    | 20+           |
| npm        | Latest stable |
| PostgreSQL | 14+           |
| Git        | Latest stable |

Maven is optional because the backend includes `mvnw` and `mvnw.cmd`.

### 1. Clone and Install

```bash
git clone https://github.com/your-org/smart-campus-hub.git
cd smart-campus-hub
npm install
```

### 2. Configure Backend

Create `backend/.env`:

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/smartcampus_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

SERVER_PORT=8008
FRONTEND_URL=http://localhost:5173

JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8008/login/oauth2/code/google

FILE_UPLOAD_DIR=./uploads
```

Important: the backend default port is `8080`, but the frontend default API URL is `http://localhost:8008/api/v1`. Use `SERVER_PORT=8008` unless you also edit `frontend/.env`.

### 3. Configure Frontend

Create `frontend/.env`:

```properties
VITE_API_BASE_URL=http://localhost:8008/api/v1
```

### 4. Create Database

```bash
createdb -U postgres smartcampus_db
```

Optional schema import:

```bash
psql -U postgres -d smartcampus_db -f backend/db/full_schemas.sql
```

### 5. Start the App

Open two terminals.

**Terminal 1: Backend**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2: Frontend**

```bash
npm run dev -w frontend
```

### Local URLs

| Service      | URL                                           |
| ------------ | --------------------------------------------- |
| Frontend     | `http://localhost:5173`                       |
| Backend API  | `http://localhost:8008/api/v1`                |
| Health Check | `http://localhost:8008/api/health`            |
| Swagger UI   | `http://localhost:8008/swagger-ui/index.html` |

### Startup Checklist

| Check                 | Expected Result                                                      |
| --------------------- | -------------------------------------------------------------------- |
| PostgreSQL is running | `smartcampus_db` exists                                              |
| Backend env exists    | `backend/.env` has `SERVER_PORT=8008`                                |
| Frontend env exists   | `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8008/api/v1` |
| Backend is healthy    | `GET /api/health` returns success                                    |
| Frontend loads        | Browser opens `http://localhost:5173`                                |

## Scripts

| Command                         | Description                      |
| ------------------------------- | -------------------------------- |
| `npm run dev -w frontend`       | Start Vite dev server            |
| `npm run build -w frontend`     | Build frontend                   |
| `npm run lint`                  | Run frontend ESLint from root    |
| `npm run lint -w frontend`      | Run frontend ESLint directly     |
| `npm run format`                | Format files with Prettier       |
| `cd backend && .\mvnw.cmd test` | Run backend tests on Windows     |
| `cd backend && ./mvnw test`     | Run backend tests on macOS/Linux |

## API Endpoints

Base URL:

```text
http://localhost:8008/api/v1
```

Health check:

```text
GET http://localhost:8008/api/health
```

### Authentication and Users

| Method  | Endpoint                   | Purpose                                 |
| ------- | -------------------------- | --------------------------------------- |
| `POST`  | `/auth/register`           | Register user                           |
| `POST`  | `/auth/login`              | Login and receive tokens                |
| `POST`  | `/auth/refresh`            | Refresh access token                    |
| `GET`   | `/auth/me`                 | Get current user                        |
| `GET`   | `/auth/bootstrap`          | Load user, dashboard path, unread count |
| `POST`  | `/auth/logout`             | Logout                                  |
| `GET`   | `/admin/users`             | List users                              |
| `PATCH` | `/admin/users/{id}/role`   | Update user role                        |
| `PATCH` | `/admin/users/{id}/status` | Update user status                      |

### Facilities and Availability

| Method   | Endpoint                                             | Purpose               |
| -------- | ---------------------------------------------------- | --------------------- |
| `GET`    | `/resources`                                         | List/filter resources |
| `GET`    | `/resources/{id}`                                    | Get resource          |
| `POST`   | `/resources`                                         | Create resource       |
| `PUT`    | `/resources/{id}`                                    | Update resource       |
| `DELETE` | `/resources/{id}`                                    | Soft delete resource  |
| `GET`    | `/resources/{id}/availability`                       | Get availability      |
| `GET`    | `/resources/{id}/maintenance-blackouts`              | List blackouts        |
| `POST`   | `/resources/{id}/maintenance-blackouts`              | Create blackout       |
| `DELETE` | `/resources/{id}/maintenance-blackouts/{blackoutId}` | Delete blackout       |

### Bookings

| Method | Endpoint                          | Purpose                   |
| ------ | --------------------------------- | ------------------------- |
| `POST` | `/bookings`                       | Create booking            |
| `POST` | `/bookings/conflicts/preview`     | Preview conflicts         |
| `GET`  | `/bookings`                       | List my bookings          |
| `GET`  | `/bookings/{id}`                  | Get booking               |
| `PUT`  | `/bookings/{id}/approve`          | Approve booking           |
| `PUT`  | `/bookings/{id}/reject`           | Reject booking            |
| `PUT`  | `/bookings/{id}/cancel`           | Cancel booking            |
| `POST` | `/bookings/{id}/check-in`         | QR check-in               |
| `GET`  | `/bookings/admin/all`             | Admin booking queue       |
| `GET`  | `/bookings/resource/{resourceId}` | Resource bookings by date |

### Tickets and Ticket Metrics

| Method   | Endpoint                                    | Purpose                   |
| -------- | ------------------------------------------- | ------------------------- |
| `POST`   | `/tickets`                                  | Create ticket with images |
| `GET`    | `/tickets`                                  | List tickets              |
| `GET`    | `/tickets/{id}`                             | Get ticket                |
| `PUT`    | `/tickets/{id}/status`                      | Update ticket status      |
| `PUT`    | `/tickets/{id}/assign`                      | Assign technician         |
| `DELETE` | `/tickets/{id}`                             | Delete ticket             |
| `POST`   | `/tickets/{id}/comments`                    | Add comment               |
| `PUT`    | `/tickets/{id}/comments/{commentId}`        | Edit comment              |
| `DELETE` | `/tickets/{id}/comments/{commentId}`        | Delete comment            |
| `GET`    | `/tickets/{id}/attachments`                 | List attachments          |
| `GET`    | `/admin/tickets/sla-metrics`                | SLA metrics               |
| `GET`    | `/admin/technician-workload`                | Technician workload       |
| `GET`    | `/admin/tickets/{id}/assignment-suggestion` | Assignment suggestion     |

### Notifications, Security, and Analytics

| Method   | Endpoint                                         | Purpose                     |
| -------- | ------------------------------------------------ | --------------------------- |
| `GET`    | `/notifications`                                 | List notifications          |
| `GET`    | `/notifications/unread-count`                    | Get unread count            |
| `PUT`    | `/notifications/{id}/read`                       | Mark one as read            |
| `PUT`    | `/notifications/read-all`                        | Mark all as read            |
| `DELETE` | `/notifications/{id}`                            | Delete notification         |
| `GET`    | `/notifications/preferences`                     | Get preferences             |
| `PUT`    | `/notifications/preferences`                     | Update preferences          |
| `GET`    | `/auth/security-activity`                        | Security logs               |
| `GET`    | `/auth/security-activity/suspicious`             | Suspicious logs             |
| `PUT`    | `/auth/security-activity/suspicious/acknowledge` | Acknowledge suspicious logs |
| `GET`    | `/admin/analytics/top-resources`                 | Top resources report        |
| `GET`    | `/admin/analytics/peak-booking-hours`            | Peak hours report           |

## Database

| Module            | Tables                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Auth and Security | `users`, `refresh_tokens`, `security_activity_logs`                             |
| Notifications     | `notifications`, `notification_preferences`                                     |
| Facilities        | `resources`, `availability_windows`, `maintenance_blackouts`, `resource_images` |
| Bookings          | `bookings`, `booking_status_history`, `waitlist_entries`                        |
| Tickets           | `tickets`, `ticket_comments`, `ticket_attachments`, `ticket_status_history`     |

## Module Ownership

| Developer   | Module                               | Responsibilities                                                                                |
| ----------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Developer 1 | Facilities and Resources             | Resource catalogue, filters, availability windows, maintenance blackouts, availability calendar |
| Developer 2 | Booking Management                   | Booking requests, conflict preview, waitlist, approval workflow, QR check-in                    |
| Developer 3 | Maintenance Tickets                  | Tickets, image upload, comments, internal notes, SLA tracking, technician workload              |
| Developer 4 | Auth, Users, Notifications, Security | JWT, refresh tokens, roles, Google OAuth, notifications, preferences, security logs             |

## Documentation

| Document                                                                 | Purpose                                        |
| ------------------------------------------------------------------------ | ---------------------------------------------- |
| [docs/DATA_FLOW_AND_MODULE_GUIDE.md](docs/DATA_FLOW_AND_MODULE_GUIDE.md) | End-to-end data flow and module ownership      |
| [docs/DATABASE_QUICK_REFERENCE.md](docs/DATABASE_QUICK_REFERENCE.md)     | Database ownership, constraints, and checklist |
| [docs/DATABASE_ERD.md](docs/DATABASE_ERD.md)                             | ERD and relationship documentation             |
| [docs/02_api_documentation.md](docs/02_api_documentation.md)             | API notes                                      |
| [backend/db/full_schemas.sql](backend/db/full_schemas.sql)               | Full PostgreSQL schema                         |
| [docs/create-apis/](docs/create-apis/)                                   | Postman collection and environment             |

## Troubleshooting

| Problem                                         | What to Check                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Frontend cannot reach backend                   | Confirm backend is running and `VITE_API_BASE_URL` matches backend port   |
| Backend starts on `8080`, frontend calls `8008` | Set `SERVER_PORT=8008` in `backend/.env` or update `frontend/.env`        |
| PostgreSQL connection fails                     | Confirm database exists and DB credentials are correct                    |
| Booking returns `400 Bad Request`               | Date must be today/future, end time after start, slot inside availability |
| Ticket upload fails                             | Check MIME type, file size, upload path, and permissions                  |
| OAuth login fails                               | Check Google OAuth client ID, secret, and redirect URI                    |
| Commit is blocked                               | Run `npm run lint` and fix ESLint errors                                  |

## Submission Checklist

- [ ] Exclude `node_modules/`, `backend/target/`, `.env` files, local logs, and upload folders.
- [ ] Confirm frontend lint/build status.
- [ ] Confirm backend tests pass.
- [ ] Include screenshots, ERD, API docs, and module explanations from `docs/`.

## License

Academic coursework project for SLIIT IT3030 PAF 2026.
