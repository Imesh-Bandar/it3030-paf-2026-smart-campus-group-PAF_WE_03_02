# 📚 Project Documentation Index

## Welcome to Smart Campus Operations Hub 🎓

This repository contains a complete development project for 4 interns working in parallel over 9 weeks.

---

## 🚀 Getting Started (Choose Your Path)

### If You're An Intern Developer 👨‍💻

**Start here:** `DEVELOPER_QUICK_START.md` (5 minutes read)

- Find your role (Dev 1/2/3/4)
- See this week's tasks
- Get environment setup steps
- Learn integration points with other devs

### If You're A Project Manager 📊

**Start here:** `DEVELOPER_ASSIGNMENTS.md` (10 minutes read)

- See developer assignments matrix
- Check 9-week sprint schedule
- Monitor success indicators by week
- Track effort distribution (560 hours)

### If You're A Code Reviewer 👀

**Start here:** Phase section in `docs/04_full_task_list.md`

- Find integration points for the code you're reviewing
- Check testing scenarios that should pass
- Verify against workflow integration specs

---

## 📋 Document Descriptions

### Core Project Documents

#### 1. **DEVELOPER_QUICK_START.md** 🎯 (NEW)

**For:** Individual developers getting started  
**Length:** ~5 min read  
**Contains:**

- Your role & responsibilities
- This week's sprint tasks
- Integration points with other developers
- Communication protocol
- First 30-minute setup steps

**When to use:** First day on the project, weekly standups

---

#### 2. **DEVELOPER_ASSIGNMENTS.md** 📊 (NEW)

**For:** Project manager, sprint planning, team leads  
**Length:** ~10 min read  
**Contains:**

- Visual phase overview with ASCII diagrams
- Week-by-week developer assignment table
- Workflow handoff points (who integrates with whom)
- Testing checklist by phase
- Effort distribution (560 hours total)
- Success indicators by week
- Key metrics to track

**When to use:** Sprint planning, progress tracking, troubleshooting delays

---

#### 3. **docs/04_full_task_list.md** 📖 (UPDATED - MAIN REFERENCE)

**For:** Detailed technical specifications, comprehensive reference  
**Length:** ~2,169 lines (comprehensive)  
**Contains:**

- Developer team overview (4 interns)
- Phase overview (progress table)
- Developer scenarios & personal workflows (🔵🟢🟣🟠)
- **NEW:** Phase-by-phase developer breakdowns with:
  - Specific hour estimates
  - Day-by-day task breakdown
  - What each developer does (concrete tasks)
  - Workflow integration points (API handoffs)
  - Testing scenarios (verification steps)
- All original technical specifications
- Week-by-week sprint schedule (9 weeks all 4 devs)
- Deliverables checklist
- Project timeline

**When to use:** Implementation details, testing verification, weekly planning

**Structure:**

```
Lines 1-35:    Headers + Team Overview
Lines 37-145:  Developer Scenarios & Personal Workflows
Lines 147-506: Phase 0-4 with Developer Breakdowns
Lines 508-848: Phase 5-6 with Developer Breakdowns
Lines 2079-2164: Week-by-Week Sprint Schedule
```

---

#### 4. **docs/02_api_documentation.md** 🔌

**For:** API endpoint specifications  
**Contains:**

- All backend endpoints (GET, POST, PUT, DELETE)
- Request/response models
- Authentication requirements
- Error codes and messages

**When to use:** Implementing APIs, testing endpoints, frontend integration

---

#### 5. **docs/03_database_schema.sql** 💾

**For:** Database structure reference  
**Contains:**

- 11 tables with relationships
- Field definitions and constraints
- Indexes
- Seed data

**When to use:** Setting up database, entity design, query optimization

---

#### 6. **docs/01_use_cases.md** 📖

**For:** User stories and workflows  
**Contains:**

- User personas
- Feature descriptions
- User flows and workflows

**When to use:** Understanding requirements, acceptance testing

---

## 🔄 How Developers Work Together

### Integration Pattern 1: Backend → Frontend (Dev 1 → Dev 2)

```
Dev 1 implements API          Dev 2 calls API
POST /api/v1/bookings   ←→   BookingForm submits
Returns: 200 or 409          Handles: success or conflict error
```

**Sync Point:** Weekly sync on API contract (endpoint, params, response)

### Integration Pattern 2: Same Developer (Dev 3)

```
Dev 3 Backend               Dev 3 Frontend
POST /api/v1/tickets   ←→   TicketForm submits
                            Detail page displays
```

**Sync Point:** Frontend must wait for API completion

### Integration Pattern 3: Service Integration (Dev 3 → Dev 4)

```
Dev 3 calls                 Dev 4 provides
NotificationService.create() → Saves to DB
                           → Displays in UI
```

**Sync Point:** Dev 3 uses Dev 4's service interface

---

## 📅 9-Week Project Timeline at a Glance

| Week    | Focus                        | Lead Dev  | Status         |
| ------- | ---------------------------- | --------- | -------------- |
| **1**   | Project Initialization       | All       | 🟨 In Progress |
| **1-2** | Authentication (OAuth + JWT) | Dev 1 + 2 | 🟨 In Progress |
| **2-3** | Facility Catalogue           | Dev 2     | ⬜ Not Started |
| **3-4** | Booking Management           | Dev 1 + 2 | ⬜ Not Started |
| **4-5** | Ticketing System             | Dev 3     | ⬜ Not Started |
| **5-6** | Notifications & Dashboards   | Dev 4     | ⬜ Not Started |
| **6-7** | Testing, Security, DevOps    | All       | ⬜ Not Started |
| **8-9** | Polish & Deployment          | Dev 4     | ⬜ Not Started |

---

## 👥 Developer Roles & Hours

| Dev          | Role           | Hours    | Focus                      |
| ------------ | -------------- | -------- | -------------------------- |
| **Dev 1** 🔵 | Backend Lead   | ~120     | Auth + Booking APIs        |
| **Dev 2** 🟢 | Frontend Lead  | ~125     | UI/UX + Facilities         |
| **Dev 3** 🟣 | Ticketing Spec | ~100     | Full-stack Tickets         |
| **Dev 4** 🟠 | DevOps         | ~150     | Notifications + Deployment |
| **Total**    |                | **~560** | 9 weeks @ 60h/week         |

---

## ✅ Testing Verification Points

Each phase has testing scenarios. Before merging to `develop`:

1. **Read testing scenarios** for your phase in `docs/04_full_task_list.md`
2. **Manually test** each scenario in browser/Postman
3. **Write automated tests** (unit or integration)
4. **Create GitHub issue** linking test results
5. **Request review** from relevant developer

**Example:** Phase 1 Auth

```
✅ User clicks "Sign in with Google" → redirected to Google login
✅ After Google auth → redirected back with tokens in URL
✅ Tokens stored in localStorage/memory
✅ Protected routes require authentication
✅ Token refresh happens automatically on 401
✅ User can logout and tokens cleared
```

---

## 🔗 Quick Reference

### By Role

- **Backend (Dev 1):** See Phase 0.2, 1.1-1.7, 3.1-3.3, 6.1-6.4
- **Frontend (Dev 2):** See Phase 0.3, 1.4-1.6, 2.3-2.5, 3.4-3.7, 6.2
- **Ticketing (Dev 3):** See Phase 0, 4 (backend + frontend), 6.2
- **DevOps (Dev 4):** See Phase 0, 5 (backend + frontend), 6.3-6.7

### By Phase

- **Phase 0:** `docs/04_full_task_list.md` lines 147-290
- **Phase 1:** `docs/04_full_task_list.md` lines 292-504
- **Phase 2:** `docs/04_full_task_list.md` lines 506-652
- **Phase 3:** `docs/04_full_task_list.md` lines 654-867
- **Phase 4:** `docs/04_full_task_list.md` lines 869-1084
- **Phase 5:** `docs/04_full_task_list.md` lines 1086-1246
- **Phase 6:** `docs/04_full_task_list.md` lines 1248-2077

### By Week

- All 9 weeks: `docs/04_full_task_list.md` lines 2079-2164

---

## 📞 Common Questions

**Q: Where do I find my specific tasks?**  
A: Open `DEVELOPER_QUICK_START.md` → find your role → check weekly sprint schedule in `docs/04_full_task_list.md`

**Q: When do I coordinate with another dev?**  
A: Check "Workflow Integration Points" in your phase section in `docs/04_full_task_list.md`

**Q: How do I verify my work is correct?**  
A: Use "Testing Scenarios" listed in your phase section

**Q: What should I read first?**  
A: If developer: `DEVELOPER_QUICK_START.md`. If manager: `DEVELOPER_ASSIGNMENTS.md`.

**Q: How are tasks organized?**  
A: By **phase** (feature), by **developer** (role), by **week** (sprint)

**Q: What's the sprint schedule?**  
A: See final section of `docs/04_full_task_list.md` (lines 2079+)

---

## 🚀 First Steps

### All Developers (Day 1)

1. Read `DEVELOPER_QUICK_START.md` (5 min)
2. Find your scenario in `docs/04_full_task_list.md` (10 min)
3. Check this week's tasks in sprint schedule (5 min)
4. Setup local environment (Phase 0 section in task list)
5. Create feature branch: `git checkout -b feature/dev[N]-phase0`
6. Start Week 1 tasks!

### Project Manager (Day 1)

1. Read `DEVELOPER_ASSIGNMENTS.md` (10 min)
2. Print or bookmark the sprint schedule section
3. Schedule weekly syncs with each dev
4. Setup progress tracking board (Jira/GitHub Issues)
5. Monitor via "Success Indicators by Week"

---

## 📊 Progress Tracking

Use this checklist to track project status:

- [ ] Week 1: All devs have environment running ✅
- [ ] Week 1-2: OAuth login working ✅
- [ ] Week 2-3: Facility browsing working ✅
- [ ] Week 3-4: Booking system working ✅
- [ ] Week 4-5: Ticketing system working ✅
- [ ] Week 5-6: Notifications working ✅
- [ ] Week 6-7: 80%+ test coverage + security ✅
- [ ] Week 8-9: Production deployment ✅

---

## 🎓 Learning Resources

- **Spring Boot:** `backend/` folder + Phase 0.2 and 1.1-1.7
- **React + TypeScript:** `frontend/` folder + Phase 0.3 and 1.4-1.6
- **PostgreSQL:** `docs/03_database_schema.sql`
- **Docker:** Phase 6.5 in task list
- **CI/CD:** Phase 6.5 in task list

---

## 📝 Conventions

- **Git Branches:** `feature/dev[N]-phase[X]` (e.g., `feature/dev1-phase1`)
- **Commit Messages:** `Week X: [Phase Y] - [What you did]`
- **Pull Requests:** Link to relevant task list lines and testing scenarios
- **Code Review:** Tag the developer who you integrate with

---

## ✨ Project Stack

- **Backend:** Spring Boot 3.3, Java 17, PostgreSQL 14
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **APIs:** REST with JWT authentication
- **DevOps:** Docker, Docker Compose, GitHub Actions
- **Testing:** JUnit 5 (backend), Vitest (frontend)

---

## 📞 Support

- **Questions on tasks?** Check task list Phase section
- **Questions on integration?** Check "Workflow Integration Points"
- **Questions on testing?** Check "Testing Scenarios"
- **Questions on setup?** Check `DEVELOPER_QUICK_START.md`
- **Questions on schedule?** Check sprint schedule table

---

## 🎉 You're All Set!

Pick your document based on your role:

- **Dev 1/2/3/4:** → `DEVELOPER_QUICK_START.md`
- **Manager/Lead:** → `DEVELOPER_ASSIGNMENTS.md`
- **Detailed specs:** → `docs/04_full_task_list.md`

**Happy coding!** 🚀

---

**Project:** Smart Campus Operations Hub  
**Duration:** 9 weeks  
**Team:** 4 Interns  
**Stack:** Spring Boot · React · PostgreSQL · Docker  
**Last Updated:** April 6, 2026
