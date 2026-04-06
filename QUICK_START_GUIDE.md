# 🚀 PostgreSQL Coursework – Quick Start Guide

## Your New Task List Files

You now have **3 task list versions** in your `docs/` folder:

### 📄 **04_full_task_list_postgresql.md** ⭐ **USE THIS ONE**

Your PostgreSQL + JPA version with:

- 4 developer modules
- PostgreSQL schema + JPA entities
- Clear backend/frontend tasks
- Timeline + submission checklist

### 📄 04_full_task_list_mongodb.md

Reference example (MongoDB version)

### 📄 04_full_task_list.md

Old version (keep for reference)

---

## 🎯 Quick Facts: Your Setup

| Component             | Your Stack                   |
| --------------------- | ---------------------------- |
| **Backend Framework** | Spring Boot 3.3              |
| **Database**          | PostgreSQL 14+               |
| **ORM**               | Spring Data JPA (Hibernate)  |
| **Frontend**          | React 18 + Vite + TypeScript |
| **Team**              | 4 Developers                 |
| **Deadline**          | 27 April 2026                |

---

## 👥 The 4 Developers

### 🔵 Developer 1: Facilities Catalogue

- **What to build:** Browse/search resources with availability
- **Database:** `resources` + `availability_windows` tables
- **Backend:** 6 REST endpoints for CRUD + filtering
- **Frontend:** List, detail, and admin form pages
- **Hours:** ~20-25 hours

### 🟢 Developer 2: Booking Management

- **What to build:** Users book facilities, admins approve
- **Database:** `bookings` table with conflict detection
- **Backend:** 7 endpoints with overlap prevention
- **Frontend:** Request, approval queue, my bookings pages
- **Hours:** ~20-25 hours

### 🟣 Developer 3: Incident Ticketing

- **What to build:** Report issues, track resolution, comment
- **Database:** `tickets`, `ticket_comments`, `ticket_attachments` tables
- **Backend:** 9 endpoints + file upload
- **Frontend:** Report, my tickets, admin dashboard
- **Hours:** ~20-25 hours

### 🟠 Developer 4: Auth & Notifications

- **What to build:** Google OAuth login, notification delivery
- **Database:** `users`, `notifications` tables
- **Backend:** OAuth 2.0, JWT, 4 notification endpoints, user management
- **Frontend:** Login page, notification bell, user dashboard
- **Hours:** ~25-30 hours

---

## 📋 What's in the PostgreSQL Task List

### For Each Developer:

**Backend Tasks (14 items):**

```
☑ Create JPA @Entity
☑ Create @Enumerated enums
☑ Create JpaRepository
☑ Create @Service with logic
☑ Create @RestController with endpoints
☑ Create DTOs
☑ Add @Valid validation
☑ Write unit tests (min 5)
☑ Write integration tests
☑ Add Swagger annotations
... and more
```

**Frontend Tasks (8 items):**

```
☑ Create pages/screens
☑ Create reusable components
☑ Implement forms
☑ Create API service (axios)
☑ Add state management
☑ Handle errors/loading
☑ Add role-based controls
... and more
```

---

## 🗄️ Database Schema at a Glance

```
users (authentication)
├─ id, email, name, picture, role, provider, providerId

resources (facilities catalogue)
├─ id, name, type, capacity, location, status, description

availability_windows
├─ id, resource_id, day_of_week, start_time, end_time

bookings (resource requests)
├─ id, user_id, resource_id, date, start_time, end_time, status

tickets (incident reporting)
├─ id, reporter_id, resource_id, location, category, priority, status

ticket_attachments
├─ id, ticket_id, file_name, stored_file_name, file_size

ticket_comments
├─ id, ticket_id, author_id, content, created_at

notifications (alerts)
├─ id, recipient_id, type, title, message, is_read
```

---

## 🚀 Getting Started (Week 1)

### All Developers Together:

1. Read the task list: `docs/04_full_task_list_postgresql.md`
2. Setup PostgreSQL (local or cloud)
3. Create Spring Boot project with JPA dependencies
4. Create React project with Vite
5. Create base entity classes

### Then Each Developer:

- Read your module's **scenario** section
- Create your JPA entities + repository
- Implement service layer
- Build REST controller endpoints
- Start React components in parallel

---

## 📊 5-Week Timeline

```
WEEK 1 (24-30 Mar)
  └─ Setup & Database Design
     - PostgreSQL database created
     - All JPA entities defined
     - Spring Boot project structure
     - React project initialized

WEEK 2 (31 Mar-6 Apr)
  └─ Modules A & B (Dev 1 + Dev 2)
     - Resource APIs working (CRUD, filters)
     - Booking APIs working (create, conflict detection)
     - Basic React pages working

WEEK 3 (7-13 Apr)
  └─ Modules C & D (Dev 3 + Dev 4)
     - Ticket APIs + file upload working
     - OAuth 2.0 login working
     - Notification service working

WEEK 4 (14-20 Apr)
  └─ Integration & UI
     - All role-based features working
     - Frontend fully integrated with backend
     - Notifications flowing through system

WEEK 5 (21-25 Apr)
  └─ Testing & Documentation
     - 70%+ test coverage
     - Postman collection exported
     - Report document completed
     - Screenshots captured

SUBMISSION (27 Apr)
  └─ Final submission by 11:45 PM
```

---

## ✅ Quality Checklist

### Per Developer:

- [ ] Min 5 unit tests per service
- [ ] Integration tests for all APIs
- [ ] Swagger/OpenAPI documentation
- [ ] Input validation on all endpoints
- [ ] Error handling implemented
- [ ] Frontend components handle errors/loading

### Team-wide:

- [ ] 70%+ test coverage per module
- [ ] Postman collection per developer
- [ ] GitHub Actions CI passing
- [ ] All endpoints tested in Postman
- [ ] Report with diagrams and screenshots

---

## 📞 Key Contacts/Resources

- **Task List:** `docs/04_full_task_list_postgresql.md`
- **API Reference:** `docs/02_api_documentation.md`
- **Database Schema:** `docs/03_database_schema.sql`
- **Use Cases:** `docs/01_use_cases.md`

---

## 🎓 Learning Goals

By the end of this project, you'll have learned:

✅ Spring Boot REST API development (JPA + PostgreSQL)  
✅ React component architecture + state management  
✅ Database design with relationships  
✅ OAuth 2.0 authentication + JWT  
✅ File upload handling  
✅ Testing (unit + integration)  
✅ API documentation (Swagger)  
✅ Git workflow + team collaboration

---

## 🎉 You're Ready!

**Your PostgreSQL coursework task list is complete and ready to execute.**

Each developer has:

- ✅ Clear scenario/personal goal
- ✅ Specific backend tasks (14 items)
- ✅ Specific frontend tasks (8 items)
- ✅ Test requirements (min 5 tests)
- ✅ Weekly milestones
- ✅ Integration points with other developers

**Start with:** Reading your module scenario in the task list file!

---

**File:** `docs/04_full_task_list_postgresql.md`  
**Stack:** Spring Boot 3.3 + React 18 + PostgreSQL 14 + JPA  
**Team:** 4 Developers  
**Deadline:** 27 April 2026

Let's build! 🚀
