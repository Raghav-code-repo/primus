# Manual integration test

The checklist below exercises the frontend against the **existing** Identity
Service. Use the existing test accounts and do not change database data.

The Course Service and the Student Service are covered by
[`MANUAL_INTEGRATION_TEST_ACADEMY.md`](MANUAL_INTEGRATION_TEST_ACADEMY.md).

## 0. Prerequisites

* PostgreSQL is running and the `olympiad_identity` database exists.
* The Identity Service starts without errors and the migrations are applied.
* `JWT_SECRET` is set for the backend (it is required to start `JwtService`).
* The browser developer tools are open (console + network tab).

## 1. Start the Identity Service on port 8080

```bash
cd D:\ws\identity-service
.\mvnw.cmd spring-boot:run
```

Expected log line: `Tomcat started on port 8080`.
Optional check of the OpenAPI document: `http://localhost:8080/v3/api-docs`
(returns JSON) and `http://localhost:8080/swagger-ui/index.html`.

## 2. Start Vite on port 5173

```bash
cd D:\ws\olympiad-identity-ui
npm run dev
```

Open `http://localhost:5173`. The application must redirect to
`http://localhost:5173/login`.

## 3. Register a test user

1. Open `http://localhost:5173/register`.
2. Leave every field empty and submit: four validation messages appear and no
   request is sent (network tab stays empty).
3. Fill in a password shorter than 8 characters: "Password must be at least 8
   characters" appears.
4. Use two different passwords: "Passwords do not match" appears.
5. Fill in a valid first name, last name, email (for example
   `test.learner@example.com`) and password and submit.
6. Expected: `POST /api/auth/register` returns **201**, the backend creates the
   user with the role `STUDENT`, and the frontend opens the student dashboard
   (`/student/dashboard`) with the name of the new account.
7. Repeat the registration with the same email: the backend answers **409**
   and the frontend shows "An account with this email already exists".
8. Optional: delete the test user afterwards in the database if the task
   requires a clean state. The frontend never writes to the database directly.

## 4. Log in with the registered user

1. Log out (button in the navigation bar) and open
   `http://localhost:5173/login`.
2. Enter an unknown email: the backend answers **401** with
   "Invalid email or password" and the frontend shows that message.
3. Enter the correct email with a wrong password: same result, the session
   stays empty.
4. Enter the correct email and password: the backend answers **200** with
   `accessToken`, `tokenType: "Bearer"`, `expiresIn` and the `user` object.
   The frontend stores the token, loads `GET /api/auth/me` and opens the
   dashboard.
5. The console must not contain the token, the password or a stack trace.

## 5. Verify that the current user is loaded

1. The dashboard shows the first name and the last name of the account and the
   email on the account page (`/profile`).
2. The role list shows `STUDENT`.
3. `GET /api/auth/me` appears exactly once in the network tab per page load
   (no repeated calls while navigating).
4. `GET /api/auth/me` carries the header `Authorization: Bearer <token>`.
5. The profile page shows the same data and the "Refresh profile" button
   re-requests the profile.
## 6. Open a protected route while logged out

1. Log out, then open `http://localhost:5173/dashboard` directly.
2. Expected: the application shows the login page (no flicker, no dashboard
   content).
3. Sign in again: the browser returns to `/dashboard`.

## 7. Test a request without a token

1. Log out and open `http://localhost:5173/admin` directly.
2. Expected: the frontend redirects to the login page and no protected request
   is sent from the browser.
3. With the browser console:
   `await fetch('http://localhost:8080/api/auth/me')`
   Expected: **401** with an empty body (Spring Security entry point).

## 8. Test an authenticated request with a token

1. Sign in and copy the token from the network tab (request header
   `Authorization`).
2. In the console:
   `await fetch('http://localhost:8080/api/auth/me', { headers: { Authorization: 'Bearer <token>' } }).then(r => r.status)`
3. Expected: **200** and the profile JSON.

## 9. Verify the actual roles and the navigation

1. Sign in as an account that has the role `ADMIN` (assign the role through
   the existing admin API or an existing test account, do not edit the seed
   data).
2. Expected: the navigation bar contains **Administration** in addition to
   Dashboard and Account. A `STUDENT` or `TEACHER` account does not see it.
3. Open the administration page:
   * `GET /api/admin/users` requires the authority `USER_READ`.
   * `GET /api/admin/roles` and `GET /api/admin/permissions` require
     `PERMISSION_MANAGE`.
4. If the role does not own those permissions the backend answers **403** and
   the page shows "Access denied" while the session stays active. The seed
   migrations do not map permissions to roles, so this is the expected result
   until an administrator assigns them.
5. Use the "Backend access check" on the account page (`/profile`): it calls
   `GET /api/rbac-test/users` and `GET /api/rbac-test/permission-management`
   and shows "Access granted" or "Access denied" per endpoint.
6. Open `http://localhost:5173/admin` as a `STUDENT`: the frontend shows the
   "Access denied" page. The backend still rejects the request independently.

## 10. Log out and confirm that protected pages are closed

1. Click "Log out" in the navigation bar.
2. Expected: the browser returns to the login page, the token is removed from
   the browser storage, and the navigation bar is gone.
3. Open `http://localhost:5173/dashboard` again: the login page is shown.
4. Note: the backend is stateless and offers no revocation endpoint. The token
   that was copied in step 8 of section 8 stays valid on the server until it
   expires. Only the copy in the browser is deleted.

## 11. Diagnose CORS, network, 401 and 403 failures

| Check | How | Expected result |
| --- | --- | --- |
| CORS | Open the console after a login attempt | No "blocked by CORS policy" message. The backend allows `http://localhost:5173` by default; if it appears, the running backend still lacks the configuration or the origin is different (see `docs/CORS.md`) |
| Preflight | Network tab, filter `OPTIONS` | One preflight per cross origin request, answered with `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Headers: authorization, content-type` |
| Backend down | Stop the Identity Service and sign in | The frontend shows "Unable to reach the Identity Service at http://localhost:8080…", no crash |
| Wrong port | Set `VITE_API_BASE_URL=http://localhost:9090` in `.env.local` and restart Vite | Same friendly error, never a mock success |
| 401 | Use an expired or manipulated token | The session is cleared, the login page shows "Your session has expired" |
| 403 | Call an admin endpoint without the permission | "Access denied", the session stays active |
| 400 | Register with an email that the backend rejects | The field message of the backend is shown next to the input |

## 12. Responsive check

1. Open the application at 375 px width (mobile): the navigation collapses into
   a toggle button, the login and registration cards use the full width and
   the form fields are stacked.
2. Open it at 1440 px: the login page shows the brand panel next to the card,
   the dashboard uses a two column card grid and the tables scroll horizontally
3. Tab through the forms: every control is reachable, the focus ring is
   visible and the labels are announced.

## 13. Verify the theme switch

1. Open `http://localhost:5173/login`. The toggle in the header shows the current
   preference ("Theme: System…", "Theme: Light…" or "Theme: Dark…").
2. Click the toggle: the preference cycles `light -> dark -> system -> light`.
   The page switches to the matching palette immediately, the native form
   controls follow (the `color-scheme` of the document element is set as well).
3. Open the browser developer tools, `Application -> Local Storage ->
   http://localhost:5173`: the key `ola.theme` contains the chosen preference
   (`light`, `dark` or `system`).
4. Reload the page: the same theme is shown, there is no flash of the other
   theme while the application starts.
5. Choose `system` and switch the operating system to the dark mode: the page
   follows the system setting without a reload.
6. Sign out: the theme preference stays, it is independent of the session.
7. Optional: set `prefers-color-scheme: dark` in the developer tools rendering
   tab and confirm that a fresh page load resolves to the dark palette.

