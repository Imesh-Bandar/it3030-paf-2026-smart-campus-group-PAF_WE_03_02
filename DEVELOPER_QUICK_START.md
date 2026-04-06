# 🚀 Developer Quick Start Guide

**Smart Campus Operations Hub** - 4 Intern Development Project  
**Duration:** 9 weeks | **Stack:** Spring Boot + React + PostgreSQL

---

## 👥 Your Developer Team

| ID           | Name                 | Role            | Focus                         |
| ------------ | -------------------- | --------------- | ----------------------------- |
| **Dev 1** 🔵 | Backend Lead         | Auth + Bookings | Java/Spring Boot backend APIs |
| **Dev 2** 🟢 | Frontend Lead        | UI/UX           | React/TypeScript frontend     |
| **Dev 3** 🟣 | Ticketing Specialist | Tickets         | Full-stack ticketing system   |
| **Dev 4** 🟠 | DevOps               | Notifications   | Notifications + Deployment    |

---

## 📍 Find Your Scenario

**Read This First:**

- Go to `docs/04_full_task_list.md`
- Search for your role color: 🔵 🟢 🟣 🟠
- Read the scenario under "DEVELOPER SCENARIOS & WORKFLOWS"

---

## 🗓️ This Week's Tasks

Check the **"Weekly Sprint Schedule"** table at the end of `docs/04_full_task_list.md`:

1. Find **your role column** (Dev 1/2/3/4)
2. Find **your week row** (Week 1, Week 1-2, etc.)
3. Your tasks are listed in that cell

**Example:**

- Dev 1, Week 1: "Setup Maven, Spring Boot deps"
- Dev 2, Week 1: "Setup Vite, React, Tailwind"

---

## 🔗 Integration Points (When Your Code Meets Another Dev's)

### Dev 1 ↔ Dev 2 (Auth)

- **Dev 1** provides: `/auth/google`, `/auth/callback`, `/auth/refresh`, `/auth/me`
- **Dev 2** calls these from login page and stores tokens
- **Test:** User can login with Google and see protected routes

### Dev 1 ↔ Dev 2 (Bookings)

- **Dev 1** provides: `POST /bookings` with conflict detection
- **Dev 2** calls from booking form
- **Test:** Conflict error shown, alternative times suggested

### Dev 3 ↔ Dev 4 (Notifications)

- **Dev 3** calls `NotificationService.createNotification()` when ticket created/updated
- **Dev 4** provides the service and displays notifications
- **Test:** Users receive notifications for ticket updates

---

## 📋 Your Deliverables This Sprint

### Dev 1 (Auth + Booking Backend)

- [ ] JWT token generation/validation
- [ ] OAuth2 Google login integration
- [ ] Booking conflict detection algorithm
- [ ] Admin approval/rejection workflow
- [ ] 85%+ test coverage

### Dev 2 (Frontend UI)

- [ ] Login/register pages with auth flow
- [ ] Facility browse with search/filters
- [ ] Booking form with date/time pickers
- [ ] "My Bookings" page with status tabs
- [ ] Responsive mobile/tablet/desktop

### Dev 3 (Ticketing System)

- [ ] Ticket entity with unique numbering (TICK-YYYYMMDD-NNNN)
- [ ] Ticket APIs (create, status update, assign)
- [ ] Comment system with thread
- [ ] Frontend ticket form and detail page
- [ ] Kanban board with drag-and-drop

### Dev 4 (Notifications & DevOps)

- [ ] Notification entity and service
- [ ] Notification bell component
- [ ] User/Admin/Tech dashboards
- [ ] Docker containers
- [ ] GitHub Actions CI/CD pipeline

---

## 📞 Communication Protocol

**Daily Standup (10 AM):**

- What you completed
- What you're working on today
- Any blockers

**When You Need Help:**

1. Check the "Workflow Integration Points" in task list
2. Message the relevant developer
3. If API issue: Share endpoint signature + request/response examples

**Code Review:**

- Push to your feature branch: `feature/dev1-auth`
- Create PR with description
- Tag reviewer (usually the developer whose code you're integrating with)

---

## 🧪 Testing Your Work

Each phase has **Testing Scenarios** - use these to verify:

**Example for Phase 1 (Auth):**

```
✅ User clicks "Sign in with Google" → redirected to Google login
✅ After Google auth → redirected back with tokens in URL
✅ Tokens stored in localStorage
✅ Protected routes require authentication
✅ Token refresh happens automatically on 401
✅ User can logout and tokens cleared
```

**For each testing scenario:**

1. Manually test in browser / Postman
2. Write automated test (unit or integration)
3. Add to GitHub issue as verification

---

## 🐛 Common Issues & Solutions

| Issue                          | Solution                                         |
| ------------------------------ | ------------------------------------------------ |
| Can't connect to database      | Check `.env` file, verify PostgreSQL running     |
| CORS errors                    | Verify backend CORS config includes frontend URL |
| Token not persisting           | Check localStorage/cookie settings in browser    |
| Conflict detection not working | Debug with `console.log()`, check date formats   |
| Notification not appearing     | Verify service call, check browser console       |

---

## 📚 Documentation Structure

```
docs/
├── 04_full_task_list.md          ← MAIN: All tasks, phases, scenarios, sprint schedule
├── 02_api_documentation.md       ← API endpoints and request/response specs
├── 03_database_schema.sql        ← Database schema
└── 01_use_cases.md               ← User stories and workflows
```

**Start Here:** `docs/04_full_task_list.md`

---

## 🎯 Success Criteria (Weekly)

**Week 1:**

- [ ] All devs have local environment running
- [ ] Backend health check working (`GET /api/health`)
- [ ] Frontend loads without errors

**Week 1-2:**

- [ ] Google OAuth login working
- [ ] Token refresh mechanism tested
- [ ] Protected routes enforced

**Week 2-3:**

- [ ] Facilities can be browsed and filtered
- [ ] Admin can create/edit facilities
- [ ] Images display correctly

**Week 3-4:**

- [ ] Users can book facilities
- [ ] Conflict detection prevents double-booking
- [ ] Admin can approve/reject bookings

...and so on through Week 7

---

## 🚀 Getting Started NOW (First 30 minutes)

### All Developers:

1. **Clone the repo** and create your feature branch

   ```bash
   git clone <repo>
   cd it3030-paf-2026-smart-campus-group-PAF_WE_03_02
   git checkout develop
   git pull
   git checkout -b feature/dev1-phase0  # Change dev1 to your number
   ```

2. **Read your scenario** in `docs/04_full_task_list.md`

3. **Find your Week 1 tasks** in the sprint schedule

4. **Setup your local environment:**

### Dev 1 (Backend):

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
mvn clean install
mvn spring-boot:run
# Visit http://localhost:8080/api/health
```

### Dev 2 (Frontend):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Visit http://localhost:5173
```

### Dev 3 & Dev 4:

Follow your developer breakdown in the task list

5. **Commit your first changes:**

   ```bash
   git add .
   git commit -m "Week 1: [Your Phase 0 task]"
   git push origin feature/dev[N]-phase0
   ```

6. **Create a Pull Request** and link to your sprint task

---

## 📞 Quick Links

- **Task List:** `docs/04_full_task_list.md`
- **API Docs:** `docs/02_api_documentation.md`
- **Database:** `docs/03_database_schema.sql`
- **GitHub Issues:** Track blockers and questions
- **Slack/Teams:** For quick questions

---

## 💡 Pro Tips

1. **Track progress:** Update checkboxes in task list as you complete items
2. **Commit often:** Small, focused commits help with reviews
3. **Write tests early:** Don't leave testing for the end
4. **Document as you go:** Add comments to complex logic
5. **Ask questions early:** Don't get stuck for more than 1 hour
6. **Review peer code:** You'll learn from other devs

---

**Next Step:** Open `docs/04_full_task_list.md` and find your scenario! 🎉
