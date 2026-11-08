# Olympiad Learning Academy - Frontend

React + TypeScript frontend for the **Olympiad Learning Academy**. It talks to
the three existing Spring Boot services of the academy:

| Service | Base URL | Responsibility |
| --- | --- | --- |
| Identity Service | `http://localhost:8080` | registration, login, JWT, roles and permissions |
| Course Service | `http://localhost:8081` | courses and course management |
| Student Service | `http://localhost:8082` | student profile, course catalogue, enrollments |
| API Gateway | `http://localhost:8088` | routes the services by their API path |

No backend endpoint, DTO, role, token format, database object or migration was
changed or invented. Every request the frontend sends was read out of the
backend source code; the verified contract is documented in
[`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

---

## 1. Requirements

| Tool | Version |
| --- | --- |
| Node.js | 20 or newer (verified with Node 24.14.1) |
| npm | 10 or newer (verified with npm 11.10.0) |
| Identity Service | running on `http://localhost:8080` |
| Course Service | running on `http://localhost:8081` |
| Student Service | running on `http://localhost:8082` |

## 2. Getting started

```bash
cd D:\ws\olympiad-identity-ui
npm install
copy .env.example .env.local     # Windows PowerShell
npm run dev
```

The dev server starts on **http://localhost:5173**.

| Command | Purpose |
| --- | --- |
| `npm run dev` | development server with hot reload |
| `npm run build` | production build (`tsc -b && vite build` -> `dist/`) |
| `npm run preview` | serves the production build |
| `npm test` | single test run (Vitest) |
| `npm run test:watch` | watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |

## 3. Environment configuration

`.env.example` contains the whole configuration:

```env
VITE_IDENTITY_API_URL=http://localhost:8080
VITE_COURSE_API_URL=http://localhost:8081
VITE_STUDENT_API_URL=http://localhost:8082
VITE_API_GATEWAY_URL=http://localhost:8088
VITE_USE_API_GATEWAY=false
```

* Every URL is read in `src/config/apiConfig.ts` from `import.meta.env`. No
  component contains a hard coded URL.
* `VITE_API_BASE_URL` is the previous name of the Identity Service variable
  and is still read as a fallback, so existing `.env.local` files keep working.
* `.env.local` and `.env.*.local` are ignored by git, so no endpoint is ever
  committed.
* **Never** put a database credential, a JWT signing secret or any other
  backend secret into a `VITE_*` variable: everything with that prefix is
  shipped to the browser. The Identity Service is the only holder of the
  signing key.

### Gateway mode

The API Gateway (`D:\ws\api-gateway`) runs on port 8088 and routes the
services **by their API path**, without any prefix:

| Gateway route | Target |
| --- | --- |
| `/api/auth/**` | Identity Service |
| `/api/courses/**` | Course Service |
| `/api/students/**` | Student Service |
| `/api/enrollments/**` | Student Service |

To use it, switch the flag and restart Vite:

```env
VITE_USE_API_GATEWAY=true
```

**Do not set a path prefix.** The frontend then requests
`http://localhost:8088/api/auth/login`. A prefix is only needed for a gateway
that mounts the services below an extra segment, and a prefix that repeats the
API path of the service (`/api/auth` for the Identity Service) is rejected
with a configuration error, because it would produce the invalid path
`/api/auth/api/auth/login`.

The gateway does not route `/api/admin/**` and `/api/rbac-test/**` yet, so the
administration and the access check answer with HTTP 404 while the gateway is
enabled. The application shows a banner with that information. The direct
service URLs stay the default until the gateway covers every endpoint - see
[docs/API_CONTRACT.md#75-the-api-gateway-does-not-route-every-endpoint](docs/API_CONTRACT.md#75-the-api-gateway-does-not-route-every-endpoint)
for the two routes that are missing.

Because `/api/courses/**` is served by the Course Service through the gateway,
the catalogue response uses a different page wrapper there (`number` instead
of `page`). `src/api/catalogApi.ts` normalises both wrappers, so the catalogue
renders identically in both modes.

## 4. Project structure

```
src/
  api/
    client.ts        Axios instances for the three services, bearer token,
                     401 handling, error normalisation
    authApi.ts       POST /api/auth/register|login, GET /api/auth/me|permissions
    adminApi.ts      GET /api/admin/users|roles|permissions
    rbacApi.ts       GET /api/rbac-test/users|permission-management
    courseApi.ts     the Course Service (management view)
    catalogApi.ts    the course catalogue of the Student Service
    studentApi.ts    GET|POST|PUT /api/students/me
    enrollmentApi.ts GET|POST|DELETE /api/enrollments
    errors.ts        ApiError + mapping of every backend error body
  auth/
    AuthContext.ts   context + types
    AuthProvider.tsx login, register, logout, session restore, 401 reset
    useAuth.ts       hook to read the context
    ProtectedRoute.tsx   ProtectedRoute / PublicOnlyRoute / RequireRole /
                         RequirePermission
    PermissionGuard.tsx  PermissionGuard / RoleGuard (inline guards)
    roles.ts         role helpers (ROLE_ prefix handling)
    tokenStorage.ts  the single place where the token is stored
  components/
    layout/          AppLayout, Navbar, AuthLayout, Breadcrumbs
    common/          Alert, FormField, PasswordField, EmptyState, Skeleton,
                     StatCard, CourseCard, EnrollButton, LoadingScreen
  config/
    apiConfig.ts     base URLs, gateway mode, configuration validation
    navigation.ts    the role driven navigation
  features/          (the features live in pages/ and hooks/, see below)
  hooks/             useAsyncResource, useStudentProfile, useMyEnrollments,
                     useCatalog
  pages/             one component per screen
  routes/            AppRoutes (React Router configuration, lazy pages)
  styles/            design tokens, layout, components, pages, academy
  theme/             ThemeProvider, ThemeContext, themeStorage, useTheme
  types/             TypeScript mirrors of the backend DTOs
  utils/             enrollmentMessages
  validation/        Zod schemas that mirror the backend bean validation
  test/              setup, shared helpers and the fake Student Service
```

## 5. Screens and the endpoints they use

| Screen | Route | Endpoints |
| --- | --- | --- |
| Login | `/login` | `POST /api/auth/login` |
| Registration | `/register` | `POST /api/auth/register` |
| Dashboard (dispatcher) | `/dashboard` | redirects to the dashboard of the roles |
| Student dashboard | `/student/dashboard` | `GET /api/students/me`, `GET /api/enrollments/me`, `GET /api/courses` |
| Faculty dashboard | `/faculty/dashboard` | `GET /api/auth/me`, `GET /api/auth/permissions` |
| Admin dashboard | `/admin/dashboard` | `GET /api/admin/users`, `GET /api/courses` |
| Parent dashboard | `/parent/dashboard` | `GET /api/auth/me` - reports that the backend has no parent capability |
| Student profile | `/student/profile` | `GET|POST|PUT /api/students/me` |
| Course catalogue | `/courses` | `GET /api/courses` (Student Service, `status=PUBLISHED`), `GET /api/enrollments/me` |
| Course details | `/courses/:id` | `GET /api/courses/{id}` |
| My Courses | `/student/courses` | `GET /api/enrollments/me`, `GET /api/courses` |
| Enrollment action | - | `POST /api/enrollments`, `DELETE /api/enrollments/{id}` |
| Course management | `/admin/courses` | `GET|POST|PUT|DELETE /api/courses` (Course Service) |
| Administration | `/admin` | `GET /api/admin/users|roles|permissions` |
| Account | `/profile` | `GET /api/auth/me`, `GET /api/auth/permissions` |

The full request and response bodies are documented in
[`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## 6. Authentication and token handling

The backend is stateless (`SessionCreationPolicy.STATELESS`), CSRF is disabled
and it returns the JWT in the JSON body. It sets **no cookie**, has **no
refresh endpoint** and **no logout/revocation endpoint**. A cookie based design
is therefore not possible without changing the backend, which is out of scope.

Implemented strategy (all of it isolated in `src/auth/tokenStorage.ts`):

1. The token is kept in memory inside the auth provider.
2. It is additionally mirrored into `sessionStorage` (key `ola.auth.session`)
   so that a page reload can restore the session. `sessionStorage` is scoped to
   the browser tab and is cleared when the tab is closed.
3. Every request to the origin of a service receives
   `Authorization: Bearer <token>`. The public endpoints (`/api/auth/login`,
   `/api/auth/register`) never carry a token, and a request to a different
   origin never receives it.
4. The expiry time comes from the backend (`expiresIn`), not from a decoded
   JWT. The frontend never decodes the token and never derives authorization
   information from it. Roles come from `GET /api/auth/me`, permissions from
   `GET /api/auth/permissions`.

### Limitations of this strategy

* Any script running on the same origin can read `sessionStorage`. A successful
  XSS can exfiltrate the token until it expires (1 hour by default,
  `security.jwt.expiration-ms`). **`sessionStorage` is not immune to XSS.**
  Mitigation: strict CSP, HTTPS, short token lifetime.
* Logging out only deletes the token from the browser. Because the backend is
  stateless and offers no revocation endpoint, **the token stays valid on the
  server until it expires**.
* There is no refresh token. When the token expires, the API answers 401, the
  frontend clears the session and returns to the login page with a "session
  expired" notice.
* There is no "remember me" option, because the backend offers no way to keep
  a session alive beyond the lifetime of the token.

### Behaviour on HTTP status codes

| Status | Frontend behaviour |
| --- | --- |
| 400 | Field errors are mapped onto the matching inputs, otherwise a readable message is shown. |
| 401 on a request **with** a token | Session is cleared, the user is redirected to `/login`, the internal return path is preserved, the login page shows "your session has expired". The redirect is performed by the route guard, not imperatively, so there is no loop. |
| 401 on login/register | Only the error message is shown, the session is untouched. |
| 403 | "Access denied" is displayed. The user stays signed in, the token is kept. |
| 404 / 409 / 422 | A message that describes the situation in the words of the backend is shown. |
| Network error / timeout | "Unable to reach the … Service at …" - the application does not crash. |

## 7. Roles, permissions and the navigation

* The database seeds the roles `STUDENT`, `TEACHER` and `ADMIN`
  (`V2__seed_initial_rbac.sql`) and the permissions `USER_READ`, `USER_CREATE`,
  `USER_UPDATE`, `USER_DELETE`, `ROLE_ASSIGN`, `PERMISSION_MANAGE`.
* `AuthResponse.UserProfile.roles` contains the **raw role names without the
  `ROLE_` prefix**. The prefix only exists inside the Spring Security
  authorities (`RbacAuthorityService`).
* The navigation is built from the reported identity
  (`src/config/navigation.ts`):

  | Account | Navigation |
  | --- | --- |
  | Student | Dashboard, My Profile, Course Catalogue, My Courses, Account |
  | Teacher | Dashboard, Course Catalogue, Course Management (only with a course permission), Account |
  | Admin | Dashboard, Course Catalogue, Course Management (only with a course permission), Administration, Account |

* The frontend guards are a usability feature only. The Identity Service
  remains the component that enforces authorization for every protected API
  (`@PreAuthorize(...)` and the JWT filter).
* The seed migrations do not create any `role_permissions` rows. Until an
  administrator maps permissions to roles through the RBAC API, even an
  `ADMIN` account receives HTTP 403 on the admin endpoints and on the course
  management. The pages render "access denied" in that case instead of failing
  silently. See
  [docs/API_CONTRACT.md#7-known-gaps-in-the-backend](docs/API_CONTRACT.md#7-known-gaps-in-the-backend).

### The dashboards

`/dashboard` opens the dashboard that matches the roles of the account:

| Role | Dashboard | Content |
| --- | --- | --- |
| `STUDENT` | `/student/dashboard` | profile summary, published course count, enrollments with their real status |
| `TEACHER` | `/faculty/dashboard` | the account and an explicit "not available yet" for the teaching features, because no backend endpoint offers them |
| `ADMIN` | `/admin/dashboard` | user count, published course count and the management links, each marked "not available" when the backend denies the request |
| `PARENT` | `/parent/dashboard` | an explicit "not available": the backend has no parent role and no parent to student relationship |

Nothing on these pages is estimated. A number that the backend does not return
is shown as "not available", never as a made up statistic.

## 8. The student profile

* The profile is read from `GET /api/students/me` and written with
  `PUT /api/students/me`.
* The identity of the profile is **never** part of a request. The Student
  Service derives it from the validated JWT (`userId` claim), so the browser
  can neither read nor change the profile of another student.
* The form only contains `fullName`, `grade`, `schoolName` and `phone`. The
  protected fields (`id`, `identityUserId`, `createdAt`, `updatedAt`) are
  displayed read only and are never sent.
* `fullName` is required, the other fields are optional. The length limits
  mirror the bean validation of the backend.
* When the backend answers 404 (no profile yet), the page offers a creation
  flow (`POST /api/students/me`). A second attempt is rejected by the backend
  with HTTP 409; the frontend never creates a duplicate on its own.

## 9. The course catalogue and the enrollment

* The catalogue is read from `GET /api/courses` of the **Student Service**.
  That endpoint applies the publication rule of the backend
  (`CourseCatalogService.DEFAULT_STATUS = "PUBLISHED"`), so the frontend does
  not send a status filter and does not decide itself what a student may see.
  A `DRAFT` course is therefore never part of the catalogue.
* The **Course Service** view (`/admin/courses`) shows every status and
  offers the create, change and delete actions. It requires the authorities
  `COURSE_READ`, `COURSE_CREATE`, `COURSE_UPDATE` and `COURSE_DELETE`.
* The search field narrows the courses of the current page; the backend only
  filters by subject, so the subject filter is the one that is sent to it.
* The enroll action sends `POST /api/enrollments` with the course id only.
  The student identity comes from the token. A double click is prevented, the
  button shows a pending state and the response updates the card.
* The business rules of the backend are surfaced as readable messages:

  | Situation | Status | Message in the interface |
  | --- | --- | --- |
  | Duplicate enrollment | 409 | "You are already enrolled in this course." |
  | Course not open for enrollment | 422 | "This course is not currently open for enrollment." |
  | Unknown course | 404 | "This course does not exist (any more)." |
  | Student Service unavailable | 503 | "The Student Service is currently unavailable…" |

* A failed request never produces a success message: the card keeps its
  previous state and the error is shown next to the button.
* **My Courses** (`/student/courses`) lists the enrollments of the signed-in
  student only (`GET /api/enrollments/me`). The course titles are resolved
  with a single catalogue request, so the page does not produce one request
  per enrollment. Cancelled enrollments are listed separately and can be
  re-activated with a new enrollment.

## 10. Accessibility and responsive design

* Every input has a real `<label>`; the validation message is connected with
  `aria-describedby` and `aria-invalid`.
* The focus ring is visible everywhere (`:focus-visible`), the colour contrast
  of both themes was chosen for the WCAG AA level.
* The navigation collapses into a toggle button below 760 px, the dashboard
  uses a responsive card grid and the tables scroll horizontally.
* Loading states are announced with `role="status"` / `aria-live="polite"`,
  errors use `role="alert"` through the alert component.
* The theme (light / dark / system) is stored in `localStorage` under
  `ola.theme` and is independent of the session.

## 11. Tests

```bash
npm test        # single run
npm run test:watch
```

Vitest + React Testing Library. All HTTP traffic is mocked, no database and no
running backend is required.

| Suite | Covers |
| --- | --- |
| `src/api/__tests__/client.test.ts` | bearer token, public endpoints, error normalisation, 401 reset, network failure |
| `src/api/__tests__/studentApi.test.ts` | the exact paths, verbs and bodies of the Student Service endpoints |
| `src/auth/__tests__/ProtectedRoute.test.tsx` | unauthenticated redirect, session restore, logout, 401 reset |
| `src/auth/__tests__/authorities.test.tsx` | authorities of the signed-in account, failed authority load |
| `src/components/__tests__/Navbar.test.tsx` | role aware navigation, no fabricated student or admin entries |
| `src/config/__tests__/navigation.test.ts` | the navigation and the dashboard of every role |
| `src/pages/__tests__/LoginPage.test.tsx` | valid login, invalid login, validation, show/hide password |
| `src/pages/__tests__/RegisterPage.test.tsx` | registration validation, duplicate email, backend field errors |
| `src/pages/__tests__/Dashboards.test.tsx` | the four dashboards, no fabricated statistics |
| `src/pages/__tests__/StudentProfilePage.test.tsx` | load, update, creation flow, errors, no protected fields in the request |
| `src/pages/__tests__/CourseCataloguePage.test.tsx` | published courses, empty state, error state, no enrollment for a draft |
| `src/pages/__tests__/Enrollment.test.tsx` | successful enrollment, 409, 422, 503, double submission |
| `src/pages/__tests__/MyCoursesPage.test.tsx` | the enrollments of the signed-in student, cancelled enrollments, no data leak between accounts |
| `src/pages/__tests__/CourseManagementPage.test.tsx` | the course list and the permission driven actions |
| `src/pages/__tests__/CourseFormPage.test.tsx` | the create and update request of the Course Service |
| `src/pages/__tests__/AdminPage.test.tsx` | the admin panels and the 403 handling |
| `src/theme/__tests__/theme.test.tsx` | the theme preference |

## 12. Manual integration test

See [`docs/MANUAL_INTEGRATION_TEST.md`](docs/MANUAL_INTEGRATION_TEST.md) for the
Identity Service and
[`docs/MANUAL_INTEGRATION_TEST_ACADEMY.md`](docs/MANUAL_INTEGRATION_TEST_ACADEMY.md)
for the Course and the Student Service.

## 13. CORS

The Identity Service carries a CORS configuration. The Course and the Student
Service have to allow the origin of the frontend as well - otherwise the
browser blocks the request before it reaches the backend. Details, the
verified request/response matrix and the Vite dev proxy alternative:
[`docs/CORS.md`](docs/CORS.md).

## 14. Troubleshooting

| Symptom | Cause | Solution |
| --- | --- | --- |
| "Unable to reach the Student Service at …" | The Student Service is not running or the port is wrong | Start it, check `VITE_STUDENT_API_URL` |
| The catalogue is empty or the page shows HTTP 502 | The Course Service requires `COURSE_READ`, which no seeded role owns | Assign the permission (see the gap list in `docs/API_CONTRACT.md`) or configure a service token in the Student Service |
| `403` on `/admin/**` or `/admin/courses` | The role does not own `USER_READ` / `PERMISSION_MANAGE` / `COURSE_*` | Assign the permission with the RBAC API; the frontend keeps the session |
| `400` with `VALIDATION_FAILED` | The request did not match the bean validation | The field errors are shown next to the inputs |
| `409` on register | The email is already registered | The message of the backend is displayed |
| `409` on an enrollment | The student is already enrolled in the course | The message of the backend is displayed |
| `422` on an enrollment | The course is not published | "This course is not currently open for enrollment." |
| Empty page, no errors | A `VITE_*` variable is missing | Create `.env.local` from `.env.example` and restart Vite |
| The banner shows a configuration error | A gateway prefix repeats the API path of the service | Remove `VITE_GATEWAY_*_PATH` or set `VITE_USE_API_GATEWAY=false` |
| The banner says "Gateway mode is enabled" | The gateway does not route `/api/admin/**` and `/api/rbac-test/**` | Add the two missing routes (see `docs/API_CONTRACT.md`) or use the direct service URLs |
