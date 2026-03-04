<div align="center">

# 🏛️ Smart Campus  

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/Security-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-Academic-lightgrey?style=for-the-badge"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-yellow?style=flat-square"/>
  <img src="https://img.shields.io/badge/Course-IT3030_PAF_2026-blueviolet?style=flat-square"/>
  <img src="https://img.shields.io/badge/Institution-SLIIT-003087?style=flat-square"/>
  <img src="https://img.shields.io/badge/Deadline-27_April_2026-red?style=flat-square"/>
</p>

> A full-stack university operations platform for managing **facility bookings**, **asset reservations**, and **maintenance/incident ticketing** — with role-based access control and Google OAuth 2.0 authentication.

</div>

---

## 📋 Table of Contents

- [Team](#-team)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [API Overview](#-api-overview)
- [Project Structure](#-project-structure)
- [Running Tests](#-running-tests)
- [Branch Strategy](#-branch-strategy)
- [Submission](#-submission)

---

## 👥 Team

| # | Engineer | Module | Role |
|---|----------|--------|------|
| 1 | _(Name)_ | Facilities & Assets Catalogue | Backend + Frontend |
| 2 | _(Name)_ | Booking Management | Backend + Frontend |
| 3 | _(Name)_ | Maintenance & Incident Ticketing | Backend + Frontend |
| 4 | _(Name)_ | Notifications + Auth & Authorization | Backend + Frontend |

---

## 🛠️ Tech Stack

| Layer | Technology | Badge |
|-------|-----------|-------|
| Backend | Java 17, Spring Boot 3.3, Spring Security 6, Spring Data JPA | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=flat-square&logo=springboot&logoColor=white) |
| Frontend | React 18, Vite, React Router v6, Axios, TanStack Query, Tailwind CSS | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) |
| Database | MySQL 8.x | ![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white) |
| Auth | Google OAuth 2.0 + JWT | ![OAuth](https://img.shields.io/badge/OAuth_2.0-4285F4?style=flat-square&logo=google&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) |
| CI/CD | GitHub + GitHub Actions | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏢 **Facilities Catalogue** | Browse, search, and filter rooms, labs, and equipment |
| 📅 **Booking Workflow** | Request → Approve/Reject → Cancel, with real-time conflict detection |
| 🔧 **Incident Ticketing** | Report faults with photo evidence and track resolution status |
| 🔔 **Notification System** | In-app notifications for all key lifecycle events |
| 🔐 **Role-Based Access** | `USER`, `ADMIN`, `TECHNICIAN` roles with secured endpoints |
| 🔑 **Google Sign-In** | Seamless OAuth 2.0 authentication via Google |

---

## ⚙️ Prerequisites

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9+-C71A36?style=flat-square&logo=apachemaven&logoColor=white)

- **Java** 17 or higher
- **Node.js** 20 or higher
- **MySQL** 8.x
- **Maven** 3.9+

---

## 🚀 Quick Start

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

> 💡 Get Google OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)  
> 📌 Redirect URI to register: `http://localhost:8080/auth/callback`

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

> ✅ API available at: `http://localhost:8080`

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

> ✅ React app available at: `http://localhost:5173`

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/v1/resources` | List all resources | ![Public](https://img.shields.io/badge/Public-4CAF50?style=flat-square) |
| `POST` | `/api/v1/resources` | Create a resource | ![Admin](https://img.shields.io/badge/ADMIN-E53935?style=flat-square) |
| `POST` | `/api/v1/bookings` | Request a booking | ![User](https://img.shields.io/badge/USER-1565C0?style=flat-square) |
| `PUT` | `/api/v1/bookings/{id}/approve` | Approve a booking | ![Admin](https://img.shields.io/badge/ADMIN-E53935?style=flat-square) |
| `POST` | `/api/v1/tickets` | Report an incident | ![User](https://img.shields.io/badge/USER-1565C0?style=flat-square) |
| `PUT` | `/api/v1/tickets/{id}/status` | Update ticket status | ![Admin](https://img.shields.io/badge/ADMIN-E53935?style=flat-square) ![Tech](https://img.shields.io/badge/TECH-F57C00?style=flat-square) |
| `GET` | `/api/v1/notifications` | Get notifications | ![Auth](https://img.shields.io/badge/Authenticated-7B1FA2?style=flat-square) |
| `GET` | `/auth/me` | Get current user | ![Auth](https://img.shields.io/badge/Authenticated-7B1FA2?style=flat-square) |

📄 Full API documentation: [`API_DOC.md`](./API_DOC.md)

---

## 📁 Project Structure

```
it3030-paf-2026-smart-campus/
├── 📂 backend/             # Spring Boot REST API
├── 📂 frontend/            # React SPA
├── 📂 docs/                # Architecture diagrams, Postman collection
├── 📄 schema.sql           # Full database schema with seed data
├── 📄 API_DOC.md           # Complete API documentation
├── 📄 DEVELOPER_GUIDE.md
├── 📄 REQUIREMENTS.md
├── 📄 TASKS.md
└── 📄 ENGINEER_TASKS.md
```

---

## 🧪 Running Tests

```bash
# Backend unit + integration tests
cd backend && mvn test

# View coverage report
open target/site/jacoco/index.html
```

![JaCoCo](https://img.shields.io/badge/Coverage-JaCoCo-brightgreen?style=flat-square&logo=java&logoColor=white)

---

## 🌿 Branch Strategy

```
main            ← 🔒 production-ready, protected
  └─ develop    ← 🔀 integration branch
       ├─ feature/module-a-[name]     👤 Engineer 1
       ├─ feature/module-b-[name]     👤 Engineer 2
       ├─ feature/module-c-[name]     👤 Engineer 3
       └─ feature/module-d-e-[name]   👤 Engineer 4
```

1. Branch from `develop` using the naming convention above
2. Commit frequently with descriptive messages
3. Open a **Pull Request** to `develop` when your feature is complete
4. **At least one** team member must review before merging

---

## 📦 Submission

| Field | Details |
|-------|---------|
| 📅 **Deadline** | 11:45 PM (GMT +5:30), 27th April 2026 |
| 🌐 **Platform** | Courseweb |
| 🗜️ **Format** | `.zip` — source code + final report PDF |
| 🚫 **Exclude** | `node_modules/`, `target/`, `.env` files |
| 📄 **Report name** | `IT3030_PAF_Assignment_2026_GroupXX.pdf` |

---

<div align="center">

Made with ❤️ by **Group PAF_WE_03_02** &nbsp;·&nbsp; SLIIT IT3030 &nbsp;·&nbsp; 2026

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)

</div>
