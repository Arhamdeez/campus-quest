# CampusQuest — Test Cases (CS 3009)

These test cases are written for the current `campus-quest-frontend` system behavior as implemented in `src/App.jsx` and its routed pages.

---

## Copy/Paste — To the point (UC-01 → UC-30)

Use this section for your submission. Each test case is short and focused: **Objective**, **Pre‑Req**, and **Steps with Expected Result**.

---

### UC-01 — Sign up (create account)

| Field | Value |
|---|---|
| **Test Case ID** | UC-01 |
| **Objective** | Create a new account and enter the app. |
| **Pre‑Req** | User is logged out; email not registered; open `/login`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open **Sign up** on `/login`. | Sign up form shown. |
| 2 | Enter name + new email + password (≥6) → **Create account**. | User logs in and lands on `/dashboard`. |
| 3 | Open `/profile`. | Name + email displayed. |

---

### UC-02 — Login (valid credentials)

| Field | Value |
|---|---|
| **Test Case ID** | UC-02 |
| **Objective** | Login and reach dashboard. |
| **Pre‑Req** | User is logged out; test user exists. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/login`. | Login form shown. |
| 2 | Enter valid email/password → **Login**. | Redirect to `/dashboard`. |
| 3 | Check top bar. | Displays user name and points. |

---

### UC-03 — Login (wrong credentials)

| Field | Value |
|---|---|
| **Test Case ID** | UC-03 |
| **Objective** | Wrong login shows error and does not sign in. |
| **Pre‑Req** | User is logged out. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/login`. | Login form shown. |
| 2 | Enter wrong password → **Login**. | Error: **Incorrect email or password.** |
| 3 | Open `/dashboard`. | Redirected to `/login`. |

---

### UC-04 — Logout

| Field | Value |
|---|---|
| **Test Case ID** | UC-04 |
| **Objective** | Logout ends session and blocks protected pages. |
| **Pre‑Req** | User is logged in. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/profile` → **Logout**. | Redirect to `/login`. |
| 2 | Open `/dashboard`. | Redirected to `/login`. |

---

### UC-05 — Dashboard navigation shortcuts

| Field | Value |
|---|---|
| **Test Case ID** | UC-05 |
| **Objective** | Dashboard loads; quick actions navigate correctly. |
| **Pre‑Req** | User is logged in. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/dashboard`. | Dashboard UI visible. |
| 2 | Click **Browse Challenges**. | Navigates to `/challenges`. |
| 3 | Click **Join Study Group**. | Navigates to `/study-groups`. |
| 4 | Click **Take Quiz**. | Navigates to `/quizzes`. |
| 5 | Click **Classes & attendance**. | Navigates to `/classes`. |
| 6 | Click **Explore Rewards**. | Navigates to `/rewards`. |

---

### UC-06 — Add class manually

| Field | Value |
|---|---|
| **Test Case ID** | UC-06 |
| **Objective** | Add a class and see it in weekly schedule. |
| **Pre‑Req** | User is logged in; open `/classes`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Expand **Add a class manually**. | Form fields appear. |
| 2 | Fill details → **Add to schedule**. | Success toast shown. |
| 3 | Check weekly schedule list. | New class appears. |

---

### UC-07 — Upload timetable photo (valid)

| Field | Value |
|---|---|
| **Test Case ID** | UC-07 |
| **Objective** | Upload a timetable image and preview it. |
| **Pre‑Req** | User logged in; open `/classes`; JPG/PNG ≤2MB available. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Choose valid image file. | Preview displays; saved message/toast shown. |
| 2 | Refresh page. | Preview still displayed. |
| 3 | **Remove photo**. | Preview removed. |

---

### UC-08 — Upload timetable photo (invalid)

| Field | Value |
|---|---|
| **Test Case ID** | UC-08 |
| **Objective** | Reject invalid timetable uploads. |
| **Pre‑Req** | User logged in; open `/classes`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Select non-image file. | Error shown (image required). |
| 2 | Select image >2MB. | Error shown (size limit). |

---

### UC-09 — Log attendance as attended (+5 once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-09 |
| **Objective** | Mark attended and get +5 points only once. |
| **Pre‑Req** | User logged in; today has a loggable class. |

| # | Step | Expected result |
|---:|---|---|
| 1 | On `/classes`, find class under **Today**. | Check-in buttons visible. |
| 2 | Click **I was there (+5 pts)**. | Status becomes **Attended**. |
| 3 | Check points. | Points +5 (first time only). |
| 4 | Try to log again. | No additional points. |

---

### UC-10 — Log attendance as missed (no points)

| Field | Value |
|---|---|
| **Test Case ID** | UC-10 |
| **Objective** | Mark missed without earning points. |
| **Pre‑Req** | User logged in; today has a loggable class. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **I missed it**. | Status becomes **Missed**. |
| 2 | Check points. | No increase. |

---

### UC-11 — Post-login prompt for unlogged class

| Field | Value |
|---|---|
| **Test Case ID** | UC-11 |
| **Objective** | After login, prompt appears for ended/unlogged class today. |
| **Pre‑Req** | Logged out; schedule has an ended unlogged class today. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Log in. | Modal “Class today — did you go?” appears. |
| 2 | Choose attended. | Attendance logged; points awarded once; modal closes. |
| 3 | Login again same day after logging. | Prompt does not reappear for that class. |

---

### UC-12 — Browse events + view details

| Field | Value |
|---|---|
| **Test Case ID** | UC-12 |
| **Objective** | Events list loads; details panel shows info. |
| **Pre‑Req** | Logged in; open `/events`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/events`. | Events list visible. |
| 2 | Click an event. | Details panel opens. |
| 3 | Click **Get Tickets**. | Link opens in new tab. |

---

### UC-13 — Join event (points once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-13 |
| **Objective** | Join event gives event points once. |
| **Pre‑Req** | Logged in; event not joined before. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open event details. | **Join Event** shown. |
| 2 | Click **Join Event**. | Points increase; joined state shown/disabled. |
| 3 | Refresh and reopen event. | Still joined; no extra points. |

---

### UC-14 — Add event

| Field | Value |
|---|---|
| **Test Case ID** | UC-14 |
| **Objective** | Create an event and see it in the list. |
| **Pre‑Req** | Logged in; open `/events`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Add Event**. | Form shown. |
| 2 | Fill fields → submit. | Event appears in list. |

---

### UC-15 — Join challenge

| Field | Value |
|---|---|
| **Test Case ID** | UC-15 |
| **Objective** | Join an available challenge. |
| **Pre‑Req** | Logged in; open `/challenges`; an Available challenge exists. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Join** on Available challenge. | Status becomes **Joined**. |

---

### UC-16 — Complete challenge (points once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-16 |
| **Objective** | Complete a joined challenge and earn points once. |
| **Pre‑Req** | Logged in; challenge is Joined. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Mark Completed**. | Status **Completed**; points awarded once. |
| 2 | Try completing again. | No extra points. |

---

### UC-17 — Leave joined challenge

| Field | Value |
|---|---|
| **Test Case ID** | UC-17 |
| **Objective** | Leave a joined (not completed) challenge. |
| **Pre‑Req** | Logged in; challenge is Joined. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Leave**. | Status returns to **Available**. |

---

### UC-18 — Browse study groups

| Field | Value |
|---|---|
| **Test Case ID** | UC-18 |
| **Objective** | Study group list renders; full groups can’t be joined. |
| **Pre‑Req** | Logged in; open `/study-groups`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open page. | Group cards visible. |
| 2 | Find full group. | Join disabled. |

---

### UC-19 — Join study group (+10 once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-19 |
| **Objective** | Join group and earn +10 points once. |
| **Pre‑Req** | Logged in; group has capacity. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Join Group**. | Joined state shown; user added. |
| 2 | Check points. | +10 once. |
| 3 | Try to join again. | No extra points. |

---

### UC-20 — Leave study group

| Field | Value |
|---|---|
| **Test Case ID** | UC-20 |
| **Objective** | Leave group removes membership. |
| **Pre‑Req** | Logged in; already joined a group. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Click **Leave Group**. | Not a member anymore; chat button hidden. |

---

### UC-21 — Study group chat access (locked if not joined)

| Field | Value |
|---|---|
| **Test Case ID** | UC-21 |
| **Objective** | Chat locked until user joins the group. |
| **Pre‑Req** | Logged in. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/study-groups/:groupId` for not-joined group. | Lock message shown. |
| 2 | Click **Join Group**. | Chat becomes accessible. |

---

### UC-22 — Send chat message

| Field | Value |
|---|---|
| **Test Case ID** | UC-22 |
| **Objective** | Send message appears in chat; empty message blocked. |
| **Pre‑Req** | Logged in; user joined group; chat open. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Type message → **Send**. | Message added with author/time. |
| 2 | Send empty message. | Not sent. |

---

### UC-23 — Browse quizzes

| Field | Value |
|---|---|
| **Test Case ID** | UC-23 |
| **Objective** | Quiz list shows quizzes and prior results indicator. |
| **Pre‑Req** | Logged in; open `/quizzes`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/quizzes`. | Quiz cards visible. |
| 2 | If attempted before, view quiz card. | Shows last score + retake option. |

---

### UC-24 — Take quiz (submit)

| Field | Value |
|---|---|
| **Test Case ID** | UC-24 |
| **Objective** | Submit quiz calculates score and shows explanations. |
| **Pre‑Req** | Logged in; open `/quizzes`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Start any quiz. | Quiz attempt page loads. |
| 2 | Try submit with unanswered questions. | Submit disabled. |
| 3 | Answer all → submit. | Score + explanations shown; result saved (shows on list). |

---

### UC-25 — Retake quiz (bonus only if best improves)

| Field | Value |
|---|---|
| **Test Case ID** | UC-25 |
| **Objective** | Points increase only when retake beats best score. |
| **Pre‑Req** | Logged in; quiz has prior stored result. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Retake quiz and score <= best. | No points increase. |
| 2 | Retake quiz and score > best. | Points increase by difference only. |

---

### UC-26 — Rewards page

| Field | Value |
|---|---|
| **Test Case ID** | UC-26 |
| **Objective** | Rewards shows points balance and reward items. |
| **Pre‑Req** | Logged in; open `/rewards`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/rewards`. | Points balance shown. |
| 2 | Scroll rewards list/grid. | Items displayed. |

---

### UC-27 — Vote in poll (one vote)

| Field | Value |
|---|---|
| **Test Case ID** | UC-27 |
| **Objective** | Vote once; options disabled after submission. |
| **Pre‑Req** | Logged in; open `/feedback`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Select a poll option. | Vote recorded; options disabled. |
| 2 | Try voting again. | No second vote accepted. |

---

### UC-28 — Submit feedback (rating required)

| Field | Value |
|---|---|
| **Test Case ID** | UC-28 |
| **Objective** | Feedback requires star rating; entry appears in list. |
| **Pre‑Req** | Logged in; open `/feedback`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Submit without selecting stars. | Error shown (rating required). |
| 2 | Select stars → submit. | Feedback appears in recent list. |

---

### UC-29 — Update profile name

| Field | Value |
|---|---|
| **Test Case ID** | UC-29 |
| **Objective** | Save display name updates UI; empty name rejected. |
| **Pre‑Req** | Logged in; open `/profile`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Enter new name → **Save**. | Top bar shows updated name. |
| 2 | Save empty name. | Error shown. |

---

### UC-30 — View leaderboard

| Field | Value |
|---|---|
| **Test Case ID** | UC-30 |
| **Objective** | Leaderboard table renders (or shows fallback warning). |
| **Pre‑Req** | Logged in; open `/leaderboard`. |

| # | Step | Expected result |
|---:|---|---|
| 1 | Open `/leaderboard`. | Leaderboard table visible. |
| 2 | If DB rules block, observe message. | Warning shown; at least user row appears. |

---

## Test Case: UC-01 — Sign up (create account)

| Field | Value |
|---|---|
| **Test Case ID** | UC-01 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a new user can create an account and reach the authenticated app. |
| **Product/Ver/Module** | CampusQuest Frontend (Vite/React) — Auth |
| **Environment** | macOS + Chrome (or any modern browser); Firebase Auth configured |
| **Assumptions** | Firebase is reachable; email not previously registered. |
| **Pre-Requisite** | User is logged out and can access `/login`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open the app and navigate to `/login`. | Login page loads. |
| 2 | Click **Sign up** tab. | Sign up form is shown (Full name, Email, Password). |
| 3 | Enter a valid full name, new email, and password (≥ 6 chars). Click **Create account**. | Account is created; user is signed in; app redirects to authenticated area (Dashboard). |
| 4 | Open **Profile** page. | Profile shows the chosen display name and email. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-02 — Login (existing user)

| Field | Value |
|---|---|
| **Test Case ID** | UC-02 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify an existing user can log in and reach the dashboard. |
| **Product/Ver/Module** | CampusQuest Frontend — Auth |
| **Environment** | macOS + Chrome; Firebase Auth configured |
| **Assumptions** | A valid user exists in Firebase Auth. |
| **Pre-Requisite** | User is logged out. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Go to `/login`. | Login form is shown. |
| 2 | Enter a registered email and correct password. Click **Login**. | User is authenticated; redirected to `/dashboard`. |
| 3 | Observe top bar user status. | Shows `<name> • <points> pts`. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-03 — Login validation (wrong credentials)

| Field | Value |
|---|---|
| **Test Case ID** | UC-03 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify incorrect credentials show an error and do not sign in. |
| **Product/Ver/Module** | CampusQuest Frontend — Auth |
| **Environment** | macOS + Chrome; Firebase Auth configured |
| **Assumptions** | A valid user exists (to test wrong password), or email does not exist (to test not found). |
| **Pre-Requisite** | User is logged out. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Go to `/login`. | Login form is shown. |
| 2 | Enter a valid email and a wrong password, then click **Login**. | Error message appears: **Incorrect email or password.** |
| 3 | Refresh the page. | Still logged out; redirected/stays on `/login`. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-04 — Logout

| Field | Value |
|---|---|
| **Test Case ID** | UC-04 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a signed-in user can log out and is returned to the login page. |
| **Product/Ver/Module** | CampusQuest Frontend — Auth/Profile |
| **Environment** | macOS + Chrome; Firebase Auth configured |
| **Assumptions** | User is currently signed in. |
| **Pre-Requisite** | User is authenticated and can access `/profile`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Navigate to **Profile**. | Profile page loads. |
| 2 | Click **Logout**. | Session ends and app redirects to `/login`. |
| 3 | Try opening `/dashboard` directly. | User is redirected to `/login`. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-05 — Dashboard quick navigation

| Field | Value |
|---|---|
| **Test Case ID** | UC-05 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify dashboard loads and quick action buttons navigate to the right pages. |
| **Product/Ver/Module** | CampusQuest Frontend — Dashboard/Navigation |
| **Environment** | macOS + Chrome |
| **Assumptions** | User is signed in. |
| **Pre-Requisite** | User is authenticated. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Navigate to `/dashboard`. | Dashboard page renders stats and quick actions. |
| 2 | Click **Browse Challenges**. | App navigates to `/challenges`. |
| 3 | Return to `/dashboard`, click **Join Study Group**. | App navigates to `/study-groups`. |
| 4 | Return to `/dashboard`, click **Take Quiz**. | App navigates to `/quizzes`. |
| 5 | Return to `/dashboard`, click **Classes & attendance**. | App navigates to `/classes`. |
| 6 | Return to `/dashboard`, click **Explore Rewards**. | App navigates to `/rewards`. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-06 — Add class manually (schedule)

| Field | Value |
|---|---|
| **Test Case ID** | UC-06 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can add a class to weekly schedule and see it listed. |
| **Product/Ver/Module** | CampusQuest Frontend — Classes/Schedule |
| **Environment** | macOS + Chrome; Realtime Database configured for `users/$uid` read/write |
| **Assumptions** | DB rules allow user read/write to their own schedule. |
| **Pre-Requisite** | User is signed in. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/classes`. | Classes page loads; schedule section is visible. |
| 2 | Expand **Add a class manually**. | Form fields appear. |
| 3 | Enter title, day, start, end, and optional room. Click **Add to schedule**. | A success toast appears: **Class added to your schedule.** |
| 4 | Check **Your weekly schedule** list. | Newly added class appears with the correct day/time/location. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-07 — Upload timetable photo (valid image)

| Field | Value |
|---|---|
| **Test Case ID** | UC-07 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can upload a timetable photo and see preview. |
| **Product/Ver/Module** | CampusQuest Frontend — Classes/Timetable |
| **Environment** | macOS + Chrome |
| **Assumptions** | Browser storage is available; selected file is an image ≤ 2MB. |
| **Pre-Requisite** | User is signed in; on `/classes`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | In **Timetable photo**, click **Choose image** and select a JPG/PNG ≤ 2MB. | Image preview appears; toast: **Timetable photo saved...** |
| 2 | Refresh the page. | Timetable photo is still displayed (saved in schedule state/storage). |
| 3 | Click **Remove photo**. | Preview disappears and photo is removed. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-08 — Upload timetable photo (invalid file)

| Field | Value |
|---|---|
| **Test Case ID** | UC-08 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify invalid timetable photo inputs are rejected with an error. |
| **Product/Ver/Module** | CampusQuest Frontend — Classes/Timetable |
| **Environment** | macOS + Chrome |
| **Assumptions** | Tester has a non-image file (e.g., `.pdf`) or an image > 2MB. |
| **Pre-Requisite** | User is signed in; on `/classes`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Click **Choose image** and select a non-image file. | Error appears: **Please choose an image file (PNG or JPG).** |
| 2 | Select an image larger than 2MB. | Error appears: **Image should be under 2 MB...** |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-09 — Log attendance (attended → points awarded once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-09 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify logging a class as attended records attendance and awards +5 points once per class/date. |
| **Product/Ver/Module** | CampusQuest Frontend — Classes/Attendance + Points |
| **Environment** | macOS + Chrome; Realtime Database rules allow user read/write to their own stats/schedule |
| **Assumptions** | A class is scheduled for today and current time is after its start time. |
| **Pre-Requisite** | User signed in; at least one class exists for today. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/classes`, scroll to **Today — were you there?**. | Today’s classes are listed with check-in buttons (if in time window). |
| 2 | Click **I was there (+5 pts)** for a class that is eligible to log. | Tag shows **Attended** and toast confirms points (or indicates already counted). |
| 3 | Check top bar points or profile points. | Points increase by 5 the first time for that class/date. |
| 4 | Attempt to click the attended button again (or re-log the same slot). | No duplicate attendance entry; points are not awarded again. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-10 — Log attendance (missed)

| Field | Value |
|---|---|
| **Test Case ID** | UC-10 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify logging a class as missed records attendance without awarding points. |
| **Product/Ver/Module** | CampusQuest Frontend — Classes/Attendance |
| **Environment** | macOS + Chrome; Realtime Database configured |
| **Assumptions** | A class is scheduled for today and can be logged. |
| **Pre-Requisite** | User signed in; at least one class exists for today. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/classes` and find a loggable class under **Today — were you there?**. | Check-in controls are visible. |
| 2 | Click **I missed it**. | Tag shows **Missed** and toast warns to review notes. |
| 3 | Check points total. | Points do not increase. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-11 — Post-login class prompt (unlogged past class)

| Field | Value |
|---|---|
| **Test Case ID** | UC-11 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a modal prompts after login for a today class that ended and is not logged. |
| **Product/Ver/Module** | CampusQuest Frontend — PostLoginClassPrompt |
| **Environment** | macOS + Chrome; Realtime Database configured |
| **Assumptions** | A class exists for today, has ended, and attendance for it is not yet recorded. |
| **Pre-Requisite** | User is logged out; schedule contains an unlogged past class today. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Log in to the app. | After reaching the app, a modal appears: **Class today — did you go?** |
| 2 | Click **Yes, I was there (+5 pts)**. | Attendance is recorded; modal closes; points increase once. |
| 3 | Log out and log in again in the same browser session/day. | Modal does not re-appear for the same slot once logged. |
| 4 | (Alternate) Click **Ask me later** or press `Esc`. | Modal closes and does not re-open during the same session. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-12 — Browse events and view event details

| Field | Value |
|---|---|
| **Test Case ID** | UC-12 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify events list loads and selecting an event shows its details panel. |
| **Product/Ver/Module** | CampusQuest Frontend — Events |
| **Environment** | macOS + Chrome; DB optional (falls back to mock feed if unavailable) |
| **Assumptions** | Event feed is available from DB or fallback mock data. |
| **Pre-Requisite** | User signed in; can access `/events`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/events`. | A list of events is shown. |
| 2 | Click an event row in the list. | Event details panel shows title, datetime, location, points, and action buttons. |
| 3 | Click **Get Tickets**. | Ticket link opens in a new tab. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-13 — Join an event (award points once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-13 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify joining an event awards the displayed points once and disables re-joining. |
| **Product/Ver/Module** | CampusQuest Frontend — Events + Points |
| **Environment** | macOS + Chrome; Realtime Database configured for stats |
| **Assumptions** | `awardPoints` is working and user has permission to update their stats. |
| **Pre-Requisite** | User is signed in; on `/events`; choose an event not previously joined. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Select an event in the list to open details. | Details panel is shown with **Join Event** button. |
| 2 | Click **Join Event**. | Points increase by that event’s `points`; button becomes disabled and shows **Joined Event**. |
| 3 | Refresh and revisit the same event. | The UI still indicates joined (cannot join twice). |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-14 — Add new event (local or DB)

| Field | Value |
|---|---|
| **Test Case ID** | UC-14 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can create an event and it appears in the events list (DB-backed or local fallback). |
| **Product/Ver/Module** | CampusQuest Frontend — Events/Create |
| **Environment** | macOS + Chrome; DB optional |
| **Assumptions** | If DB rules block `/events`, app shows an error; otherwise it saves successfully. |
| **Pre-Requisite** | User signed in; on `/events`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Click **Add Event**. | Add Event form is shown. |
| 2 | Fill required fields (title, datetime, location, points) and submit. | New event appears in list and becomes selected; form closes. |
| 3 | If DB write is blocked, attempt submit again. | Error appears: **Could not save event... Check database rules for /events.** |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-15 — Join a challenge

| Field | Value |
|---|---|
| **Test Case ID** | UC-15 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify an available challenge can be joined and status updates to Joined. |
| **Product/Ver/Module** | CampusQuest Frontend — Challenges |
| **Environment** | macOS + Chrome |
| **Assumptions** | At least one challenge is `Available` and (if scheduled) within join window. |
| **Pre-Requisite** | User signed in; on `/challenges`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/challenges`. | Challenge list loads with statuses. |
| 2 | For an Available challenge, click **Join**. | Status label changes to **Joined** and action buttons appear. |
| 3 | If challenge is scheduled and upcoming, verify join is disabled. | Shows disabled button **Opens in ...** until window opens. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-16 — Complete a joined challenge (award points once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-16 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a joined challenge can be marked completed and points are awarded once. |
| **Product/Ver/Module** | CampusQuest Frontend — Challenges + Points |
| **Environment** | macOS + Chrome; Realtime Database configured for stats |
| **Assumptions** | Challenge is in a completable window (for scheduled challenges). |
| **Pre-Requisite** | User signed in; challenge is in **Joined** state. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | On `/challenges`, locate a Joined challenge. | Buttons **Mark Completed** and **Leave** are visible. |
| 2 | Click **Mark Completed** (within allowed window). | Status changes to **Completed** and user points increase by challenge points. |
| 3 | Refresh and revisit challenges. | Challenge remains completed and cannot award again. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-17 — Leave a joined challenge (before completion)

| Field | Value |
|---|---|
| **Test Case ID** | UC-17 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a joined challenge can be left, returning it to Available (if not already completed). |
| **Product/Ver/Module** | CampusQuest Frontend — Challenges |
| **Environment** | macOS + Chrome |
| **Assumptions** | At least one challenge can be joined and has not been completed. |
| **Pre-Requisite** | User signed in; challenge is Joined. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Join an available challenge. | Status becomes **Joined**. |
| 2 | Click **Leave**. | Status returns to **Available**. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-18 — Browse study groups

| Field | Value |
|---|---|
| **Test Case ID** | UC-18 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify study groups list renders and shows join state/capacity. |
| **Product/Ver/Module** | CampusQuest Frontend — Study Groups |
| **Environment** | macOS + Chrome |
| **Assumptions** | Initial mock groups load in app state. |
| **Pre-Requisite** | User signed in; on `/study-groups`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/study-groups`. | Cards show group name, topic, schedule, location, and member count. |
| 2 | Locate a group at capacity. | **Join Group** is disabled for that card. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-19 — Join a study group (award points once)

| Field | Value |
|---|---|
| **Test Case ID** | UC-19 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can join a study group and receives join points one time. |
| **Product/Ver/Module** | CampusQuest Frontend — Study Groups + Points |
| **Environment** | macOS + Chrome; Realtime Database configured for stats |
| **Assumptions** | There is at least one group with available capacity. |
| **Pre-Requisite** | User signed in; on `/study-groups`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Click **Join Group** on a group with capacity. | Card updates to show **Joined**; member list includes user. |
| 2 | Verify points. | Total points increase by 10 the first time for that group. |
| 3 | Refresh and attempt to join again. | Join is not offered again (already joined); no extra points. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-20 — Leave a study group

| Field | Value |
|---|---|
| **Test Case ID** | UC-20 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a joined user can leave a study group and membership updates. |
| **Product/Ver/Module** | CampusQuest Frontend — Study Groups |
| **Environment** | macOS + Chrome |
| **Assumptions** | User is already a member of at least one group. |
| **Pre-Requisite** | User signed in; joined a group. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | On `/study-groups`, find a group you joined. | Card shows Joined state. |
| 2 | Click **Leave Group**. | User is removed from members; card no longer shows Joined; chat button disappears. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-21 — Open study group chat (must be joined)

| Field | Value |
|---|---|
| **Test Case ID** | UC-21 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify chat is accessible only for group members and is locked otherwise. |
| **Product/Ver/Module** | CampusQuest Frontend — Study Group Chat |
| **Environment** | macOS + Chrome |
| **Assumptions** | At least one study group exists. |
| **Pre-Requisite** | User signed in. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Navigate directly to `/study-groups/<groupId>` for a group you have NOT joined. | Chat view shows **Join this group to view and participate in chat** and a **Join Group** button. |
| 2 | Click **Join Group** inside chat lock. | User joins; chat list and message input become visible. |
| 3 | Click **Back to Study Groups**. | Returns to `/study-groups`. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-22 — Send a study group message

| Field | Value |
|---|---|
| **Test Case ID** | UC-22 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify a joined user can send a message and it appears in the chat list. |
| **Product/Ver/Module** | CampusQuest Frontend — Study Group Chat |
| **Environment** | macOS + Chrome |
| **Assumptions** | User is a member of the group; chat page is open. |
| **Pre-Requisite** | User joined a study group and opened its chat. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | In the chat input, type a message and click **Send**. | New message appears immediately with author = user display name and a time label. |
| 2 | Send an empty/whitespace-only message. | Message is not sent; chat list does not change. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-23 — Browse quizzes

| Field | Value |
|---|---|
| **Test Case ID** | UC-23 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify quizzes list renders and shows completion chips when results exist. |
| **Product/Ver/Module** | CampusQuest Frontend — Quizzes |
| **Environment** | macOS + Chrome |
| **Assumptions** | Quiz catalog is available from `mockData`. |
| **Pre-Requisite** | User signed in; on `/quizzes`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/quizzes`. | Quiz cards display title, description, max points, duration, question count. |
| 2 | If a quiz was previously attempted, observe the card. | It shows **Last score** chip and **Retake Quiz** button. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-24 — Take a quiz (submit answers → feedback + saved score)

| Field | Value |
|---|---|
| **Test Case ID** | UC-24 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify submitting a quiz calculates score, shows explanations, and persists result to the app state/DB. |
| **Product/Ver/Module** | CampusQuest Frontend — QuizAttempt + Points |
| **Environment** | macOS + Chrome; Realtime Database configured for quizResults and stats (optional but recommended) |
| **Assumptions** | User can access `/quizzes/:quizId`. |
| **Pre-Requisite** | User signed in; on `/quizzes`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Click **Start Quiz** on any quiz. | Navigates to `/quizzes/<quizId>` and shows questions with progress bar. |
| 2 | Attempt to submit with unanswered questions. | **Submit Answers** is disabled until all questions have answers. |
| 3 | Answer all questions and click **Submit Answers**. | Explanations render; performance feedback section appears with points earned. |
| 4 | Click **Back to Quizzes**. | Returns to `/quizzes` and quiz card shows last score chip. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-25 — Retake quiz (best-score bonus points only)

| Field | Value |
|---|---|
| **Test Case ID** | UC-25 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify reattempting a quiz awards points only when a new best score is achieved. |
| **Product/Ver/Module** | CampusQuest Frontend — QuizAttempt + awardPoints |
| **Environment** | macOS + Chrome; Realtime Database configured for stats |
| **Assumptions** | User has a prior stored quiz result for the selected quiz. |
| **Pre-Requisite** | User signed in; has already completed a quiz once. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | From `/quizzes`, click **Retake Quiz**. | Quiz attempt page loads. |
| 2 | Submit answers resulting in a LOWER or equal earned points than the previous best. | Total points do not increase; last-attempt is stored but best remains unchanged. |
| 3 | Retake again and achieve a HIGHER earned points than previous best. | Total points increase by the **difference** (bonus); best score updates. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-26 — Rewards store (view balance and items)

| Field | Value |
|---|---|
| **Test Case ID** | UC-26 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify rewards page shows the current points balance and reward items. |
| **Product/Ver/Module** | CampusQuest Frontend — Rewards |
| **Environment** | macOS + Chrome |
| **Assumptions** | User is signed in. |
| **Pre-Requisite** | User authenticated; navigate to `/rewards`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/rewards`. | Balance card shows `<points> Points`. |
| 2 | Scroll the rewards grid. | Reward items are displayed with title/description. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-27 — Vote in a poll (one vote per poll)

| Field | Value |
|---|---|
| **Test Case ID** | UC-27 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can vote in a poll once and options become disabled afterward. |
| **Product/Ver/Module** | CampusQuest Frontend — Feedback/Polls |
| **Environment** | macOS + Chrome |
| **Assumptions** | Polls exist on `/feedback`. |
| **Pre-Requisite** | User signed in; on `/feedback`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/feedback`. | Poll tabs render; a poll is selected by default. |
| 2 | Click one poll option. | Vote count increments; option buttons become disabled; badge shows **Vote submitted**. |
| 3 | Attempt to vote again on the same poll. | No additional vote is recorded (buttons remain disabled). |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-28 — Submit feedback (requires star rating)

| Field | Value |
|---|---|
| **Test Case ID** | UC-28 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify feedback submission requires area, message, and a star rating; new feedback appears in the list. |
| **Product/Ver/Module** | CampusQuest Frontend — Feedback |
| **Environment** | macOS + Chrome |
| **Assumptions** | Feedback page uses in-memory state for entries. |
| **Pre-Requisite** | User signed in; on `/feedback`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Enter Area and Message but do NOT pick a star rating. Click **Submit Feedback**. | Error appears: **Select a rating from 1 to 5 stars.** |
| 2 | Click a star rating (1–5) and submit again. | Entry is added to top of **Recent Feedback** list with author **You** and correct rating. |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-29 — Update profile display name

| Field | Value |
|---|---|
| **Test Case ID** | UC-29 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify user can change display name and it updates in UI (and group membership/messages for demo groups). |
| **Product/Ver/Module** | CampusQuest Frontend — Profile |
| **Environment** | macOS + Chrome; Firebase Auth + Realtime Database configured |
| **Assumptions** | DB rules allow updating `users/$uid/profile/name`. |
| **Pre-Requisite** | User signed in; on `/profile`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | In **Display name**, enter a new full name and click **Save**. | Save completes; header/top bar updates to new name. |
| 2 | If the user is a member of any demo study group, open `/study-groups`. | Member list reflects the new name (old name replaced). |
| 3 | Try saving an empty name. | Error appears: **Enter your full name.** |

**Comments**: Pass/Fail/Not Executed

---

## Test Case: UC-30 — View leaderboard

| Field | Value |
|---|---|
| **Test Case ID** | UC-30 |
| **Test Case Version** | 1.0 |
| **Test Date** | 2026-04-20 |
| **Objective** | Verify leaderboard loads and ranks students by points (with fallback when DB rules block). |
| **Product/Ver/Module** | CampusQuest Frontend — Leaderboard |
| **Environment** | macOS + Chrome; Realtime Database configured |
| **Assumptions** | If DB allows reading `/users`, full leaderboard loads; else fallback row is shown with a warning message. |
| **Pre-Requisite** | User signed in; can access `/leaderboard`. |

| Step No. | Execution description | Procedure result |
|---:|---|---|
| 1 | Open `/leaderboard`. | Page shows stats and table with Rank/Student/Points/Streak/Badges/Classes. |
| 2 | If DB rules block `/users`, observe the page message. | Warning shows: **Full leaderboard blocked by database rules...** and at least the current user row is displayed. |

**Comments**: Pass/Fail/Not Executed

