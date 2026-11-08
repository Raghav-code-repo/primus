# Manual integration test: Course Service and Student Service

This checklist exercises the frontend against the **existing** Course Service
(`http://localhost:8081`) and Student Service (`http://localhost:8082`). Use the
existing test accounts and do not change database data.

The Identity Service part of the checklist is in
[`MANUAL_INTEGRATION_TEST.md`](MANUAL_INTEGRATION_TEST.md).

## 0. Prerequisites

* PostgreSQL is running and the three databases exist.
* The Identity, Course and Student Services start without errors and their
  migrations are applied.
* `JWT_SECRET` is set for the Identity Service and the same secret is used by
  the Student Service (`JWT_SECRET_B64`).
* The browser developer tools are open (console + network tab).

```bash
cd D:\ws\identity-service  ; .\mvnw.cmd spring-boot:run   # 8080
cd D:\ws\course-service    ; .\mvnw.cmd spring-boot:run   # 8081
cd D:\ws\student-service   ; .\mvnw.cmd spring-boot:run   # 8082
cd D:\ws\olympiad-identity-ui ; npm run dev                # 5173
```

## 1. Sign in and check the dashboard

1. Register or sign in with an account that has the role `STUDENT`.
2. Expected: the browser opens `/dashboard` and is redirected to
   `/student/dashboard`. The network tab shows `GET /api/auth/me` and
   `GET /api/auth/permissions`.
3. The dashboard shows the name of the account, the profile summary
   (`GET /api/students/me` on port 8082), the published course count and the
   enrollments of the account.
4. The navigation contains **Dashboard**, **My Profile**, **Course
   Catalogue**, **My Courses** and **Account**. It does **not** contain
   **Administration** or **Course Management**.

## 2. The student profile

1. Open `http://localhost:5173/student/profile`.
2. Expected: `GET /api/students/me` on port 8082 with the header
   `Authorization: Bearer <token>`.
3. If the backend answers 404 (no profile yet), the page offers
   **Create your profile**. Fill in the name and save:
   `POST /api/students/me` returns 201 and the page shows "Profile saved".
4. Click **Edit profile**, change the grade and save:
   `PUT /api/students/me` returns 200 and the page reloads the profile.
5. Check the request body of the `PUT`: it contains `fullName`, `grade`,
   `schoolName` and `phone` - **no** `id`, `identityUserId`, `roles` or
   timestamps.
6. Clear the grade field and save: the grade becomes empty. The backend only
   applies a value that is not null.
7. Expected: the protected fields (Profile ID, Identity user ID, Created,
   Updated) are displayed read only.

## 3. The course catalogue

1. Open `http://localhost:5173/courses`.
2. Expected: `GET /api/courses` on port **8082** (the Student Service). The
   request carries **no** `status` parameter - the backend applies its own
   publication rule.
3. Only courses with the status `PUBLISHED` are listed. A `DRAFT` course must
   not appear.
4. Filter by the subject: the request carries `?subject=…` and the list
   shrinks. The search field narrows the courses of the current page only.
5. If the catalogue is empty, the empty state appears with a link to reset the
   filter.
6. If the Student Service or the Course Service is not reachable, the page
   shows "The course catalogue could not be loaded" and never crashes.

### 3.1 If the catalogue answers with HTTP 502

The Student Service forwards the read to the Course Service, and the Course
Service requires the authority `COURSE_READ`. The seed migrations do not map
any permission to a role, so the call is rejected with 403 and the Student
Service answers with 502. This is a **backend gap**, not a frontend bug:

* either assign `COURSE_READ` to the `STUDENT` role with the existing RBAC
  API of the Identity Service,
* or configure a service token (`app.course-service.token`) in the Student
  Service that belongs to an account with `COURSE_READ`.

## 4. The enrollment

1. As a student, click **Enroll** on a published course.
2. Expected: `POST /api/enrollments` on port 8082 with the body
   `{"courseId":"<uuid>"}` - **no identity**, the student comes from the token.
3. The button shows "Enrolling…", is disabled while the request runs and the
   card shows **Enrolled** afterwards. Exactly one request is sent, a double
   click cannot create two enrollments.
4. Click **Enroll** again in another tab:
   * `409 Conflict` -> "You are already enrolled in this course."
5. Try to enroll in a `DRAFT` course (call
   `POST /api/enrollments` with the id of a draft course in the console):
   * `422 Unprocessable Content` -> "This course is not currently open for
     enrollment."
6. Stop the Student Service and click **Enroll**:
   * the page shows "Unable to reach the Student Service …", the card keeps
     its state and **no** success message appears.

## 5. My Courses

1. Open `http://localhost:5173/student/courses`.
2. Expected: `GET /api/enrollments/me` returns only the enrollments of the
   signed-in account. The course titles are resolved with **one** additional
   `GET /api/courses` request, not one request per enrollment.
3. Cancelled enrollments are listed in their own section.
4. Click **Cancel enrollment**: `DELETE /api/enrollments/{id}` returns 204 and
   the enrollment moves to the cancelled section.
5. Sign out, sign in with another account and open **My Courses** again:
   the list of the first account is gone, no course of the other account is
   shown.

## 6. The administration and the course management

1. Sign in with an account that has the role `ADMIN`.
2. Expected: the navigation contains **Administration** and, if the account
   owns a course permission, **Course Management**.
3. Open `/admin`: `GET /api/admin/users` requires `USER_READ`,
   `GET /api/admin/roles` and `GET /api/admin/permissions` require
   `PERMISSION_MANAGE`. As long as no permission is mapped to a role, the
   panels show "Access denied" and the session stays active.
4. Open `/admin/courses`: it requires `COURSE_READ`. The list shows every
   status, the **New course** action requires `COURSE_CREATE` and the delete
   action requires `COURSE_DELETE`.

## 7. The faculty and the parent dashboard

1. Sign in with an account that has the role `TEACHER`:
   `/faculty/dashboard` opens and states that the backend offers no teaching
   specific endpoint. No class, roster or grade is invented.
2. `/parent/dashboard` states that the backend has no parent role and no
   parent to student relationship. No linked student is simulated.

## 8. Diagnose CORS, network, 401 and 403 failures

| Check | How | Expected result |
| --- | --- | --- |
| CORS | Open the console after a login attempt | The Course and the Student Service have to allow `http://localhost:5173`. A blocked request never reaches the backend. |
| Student Service down | Stop the service and open the catalogue | "Unable to reach the Student Service at http://localhost:8082…" |
| Wrong port | Set `VITE_STUDENT_API_URL=http://localhost:9090` and restart Vite | The same friendly error, never a mock success |
| 401 | Use an expired or manipulated token | The session is cleared, the login page shows "Your session has expired" |
| 403 | Call a protected endpoint without the permission | "Access denied", the session stays active |
| 404 | Open a course with an unknown id | "The course could not be loaded" |
| 409 / 422 | See sections 4.4 and 4.5 | The message of the backend |

## 9. Responsive check

1. Open the application at 375 px width (mobile): the navigation collapses
   into a toggle button, the course cards use one column and the tables scroll
   horizontally.
2. Open it at 1440 px: the course cards use three columns, the dashboard uses
   a three column statistics grid.
3. Tab through the forms: every control is reachable, the focus ring is
   visible and the labels are announced.
