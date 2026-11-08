# API contract of the academy

Everything the frontend calls was read out of the backend source code, not
guessed. This document is the contract the frontend is built against.

| Service | Repository | Base URL |
| --- | --- | --- |
| Identity Service | `D:\ws\identity-service` | `http://localhost:8080` |
| Course Service | `D:\ws\course-service` | `http://localhost:8081` |
| Student Service | `D:\ws\student-service` | `http://localhost:8082` |
| API Gateway | `D:\ws\api-gateway` | `http://localhost:8088` |

The API Gateway exists and runs on port 8088. It routes the services **by their
API path, without any prefix**:

| Gateway route | Target |
| --- | --- |
| `/api/auth/**` | Identity Service |
| `/api/courses/**` | Course Service |
| `/api/students/**` | Student Service |
| `/api/enrollments/**` | Student Service |

So the frontend addresses the gateway with the plain API paths, for example
`http://localhost:8088/api/auth/login`. A path prefix is **not** used - a
prefix that repeats the API path (`/api/auth`) produces the invalid path
`/api/auth/api/auth/login` and is rejected by the configuration.

The gateway does **not** route `/api/admin/**` and `/api/rbac-test/**`, so the
administration and the access check answer with HTTP 404 while the gateway is
enabled. See [section 7](#7-known-gaps-in-the-backend).

---

## 1. Authentication

Source: `com.olympiad.identity.controller.AuthController`,
`com.olympiad.identity.dto.*`, `com.olympiad.identity.service.JwtService`.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | public | `RegisterRequest` | `201` + `AuthResponse` |
| POST | `/api/auth/login` | public | `LoginRequest` | `200` + `AuthResponse` |
| GET | `/api/auth/me` | bearer | - | `200` + `AuthResponse.UserProfile` |
| GET | `/api/auth/permissions` | bearer | - | `200` + `CurrentAuthoritiesResponse` |
| POST | `/api/auth/change-password` | bearer | `ChangePasswordRequest` | `204` |
| POST | `/api/auth/forgot-password` | public | `ForgotPasswordRequest` | `204` |
| POST | `/api/auth/reset-password` | public | `ResetPasswordRequest` | `204` |

```jsonc
// RegisterRequest - exactly these four fields
{ "email": "string", "password": "string", "firstName": "string", "lastName": "string" }

// LoginRequest
{ "email": "string", "password": "string" }

// AuthResponse
{
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": ["STUDENT"]
  }
}

// CurrentAuthoritiesResponse
{ "subject": "learner@example.com", "authorities": ["ROLE_STUDENT", "COURSE_READ"] }
```

* Registration always assigns the role **`STUDENT`** (`AuthService.register`).
  The request cannot carry a role, so a public user cannot make themselves an
  administrator.
* Registration returns a valid `accessToken`, so the frontend establishes the
  session directly instead of asking for a second login.
* There is **no refresh endpoint and no revocation endpoint**. The backend is
  stateless (`SessionCreationPolicy.STATELESS`) and sets **no cookie**.

### Roles and authorities

| Source | Value |
| --- | --- |
| `roles` in `GET /api/auth/me` | `STUDENT`, `TEACHER`, `ADMIN` (raw, no `ROLE_` prefix) |
| Authorities in `GET /api/auth/permissions` | `ROLE_STUDENT`, `ROLE_TEACHER`, `ROLE_ADMIN` plus the mapped permission codes |
| Seeded roles (`V2__seed_initial_rbac.sql`) | `STUDENT`, `TEACHER`, `ADMIN` |
| Seeded permissions | `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`, `ROLE_ASSIGN`, `PERMISSION_MANAGE` |

There is **no `PARENT` role** and **no parent to student relationship** in the
backend. There is also no `TEACHER` specific data endpoint. The frontend
therefore shows an explicit "not available" state instead of inventing data.

### JWT claims (`JwtService.generateToken`)

```jsonc
{
  "sub": "learner@example.com",
  "userId": "uuid",
  "email": "learner@example.com",
  "roles": ["STUDENT"],
  "permissions": [],
  "authorities": ["ROLE_STUDENT"],
  "iat": 1760000000,
  "exp": 1760003600
}
```

The Student Service reads `userId` and `roles` directly from the token
(`CurrentUserSupport`), so the browser never has to send an identity.

---

## 2. Courses (Course Service, `http://localhost:8081`)

Source: `com.olympiad.course.controller.CourseController`,
`com.olympiad.course.dto.CourseRequest`, `CourseResponse`.

| Method | Path | Authority | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/courses` | `COURSE_READ` | query: `status`, `subject`, `page`, `size` | `200` + Spring `Page<CourseResponse>` |
| GET | `/api/courses/{id}` | `COURSE_READ` | - | `200` + `CourseResponse` |
| POST | `/api/courses` | `COURSE_CREATE` | `CourseRequest` | `201` + `CourseResponse` |
| PUT | `/api/courses/{id}` | `COURSE_UPDATE` | `CourseRequest` | `200` + `CourseResponse` |
| DELETE | `/api/courses/{id}` | `COURSE_DELETE` | - | `204` |

```jsonc
// CourseRequest
{
  "code": "MATH-OLY-001",          // @NotBlank @Size(max = 30)
  "title": "Mathematics Olympiad",  // @NotBlank @Size(max = 150)
  "description": "…",              // @Size(max = 2000), optional
  "subject": "Mathematics",         // @NotBlank @Size(max = 100)
  "gradeLevel": "Grade 6",          // @NotBlank @Size(max = 50)
  "status": "DRAFT"                 // DRAFT | PUBLISHED | ARCHIVED
}

// CourseResponse
{
  "id": "uuid",
  "code": "MATH-OLY-001",
  "title": "Mathematics Olympiad",
  "description": "…",
  "subject": "Mathematics",
  "gradeLevel": "Grade 6",
  "status": "PUBLISHED",
  "createdAt": "2026-10-21T08:51:22Z",
  "updatedAt": "2026-10-21T08:51:22Z"
}
```

`GET /api/courses` without a `status` parameter returns **every** status - the
Course Service does not apply a publication rule of its own.

---

## 3. Student profile (Student Service, `http://localhost:8082`)

Source: `com.olympiad.student.controller.StudentController`,
`com.olympiad.student.dto.StudentResponse`.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/students/me` | authenticated | - | `200` + `StudentResponse`, `404` when no profile exists |
| POST | `/api/students/me` | authenticated | `StudentProfileRequest` | `201` + `StudentResponse`, `409` when a profile already exists |
| PUT | `/api/students/me` | authenticated | `StudentUpdateRequest` | `200` + `StudentResponse` |

```jsonc
// StudentProfileRequest / StudentUpdateRequest
{
  "fullName": "Ada Lovelace",  // @NotBlank @Size(max = 100)
  "grade": "Grade 6",          // @Size(max = 20), optional
  "schoolName": "…",           // @Size(max = 100), optional
  "phone": "+49 30 123456"     // @Size(max = 50), optional
}

// StudentResponse
{
  "id": 7,
  "identityUserId": "uuid",
  "fullName": "Ada Lovelace",
  "grade": "Grade 6",
  "schoolName": "…",
  "phone": "+49 30 123456",
  "createdAt": "2026-10-21T08:51:22Z",
  "updatedAt": "2026-10-21T08:51:22Z"
}
```

* The identity comes from the `userId` claim of the validated JWT. No endpoint
  accepts an identity of another student.
* `PUT` only applies a field that is **not null**, so an empty string clears a
  value and an omitted field keeps the stored one.
* `POST /api/students/me` is the only way to create a profile. The frontend
  never creates one automatically.

---

## 4. Course catalogue (Student Service)

Source: `com.olympiad.student.controller.CourseCatalogController`,
`com.olympiad.student.service.CourseCatalogService`.

| Method | Path | Auth | Query | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/courses` | authenticated | `status` (default `PUBLISHED`), `subject`, `page` (>= 0), `size` (1..100) | `200` + `CoursePageResponse` |
| GET | `/api/courses/{id}` | authenticated | - | `200` + `CourseSummaryResponse`, `404` when unknown |

```jsonc
// CoursePageResponse - note: different field names than the Spring page
{
  "content": [ /* CourseSummaryResponse */ ],
  "page": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5
}
```

The Student Service owns no courses: it forwards the read to the Course Service
and applies the **publication rule** of the backend
(`CourseCatalogService.DEFAULT_STATUS = "PUBLISHED"`). The frontend therefore
does not send a `status` filter and does not decide itself which courses a
student may see.

---

## 5. Enrollments (Student Service)

Source: `com.olympiad.student.controller.EnrollmentController`,
`com.olympiad.student.service.EnrollmentService`.

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/enrollments/me` | authenticated | - | `200` + `EnrollmentResponse[]` |
| POST | `/api/enrollments` | authenticated | `{ "courseId": "uuid" }` | `201` + `EnrollmentResponse` (new), `200` (re-activated) |
| DELETE | `/api/enrollments/{id}` | owner or admin | - | `204` |
| GET | `/api/enrollments/{id}` | owner or admin | - | `200` + `EnrollmentResponse` |
| GET | `/api/enrollments` | `ADMIN` / `ROLE_ADMIN` / `ENROLLMENT_READ` | `identityUserId`, `courseId` | `200` + `EnrollmentResponse[]` |

```jsonc
// EnrollmentResponse
{
  "id": 11,
  "identityUserId": "uuid",
  "studentProfileId": 7,
  "courseId": "uuid",
  "status": "ACTIVE",     // ACTIVE | CANCELLED
  "createdAt": "2026-10-21T09:00:00Z",
  "updatedAt": "2026-10-21T09:00:00Z"
}
```

Business rules of the backend:

| Situation | Status | Backend source |
| --- | --- | --- |
| The student already has an **active** enrollment for the course | `409 Conflict` | `DuplicateEnrollmentException` |
| The course exists but is not `PUBLISHED` | `422 Unprocessable Content` | `CourseNotEnrollableException` |
| The course does not exist | `404 Not Found` | `CourseNotFoundException` |
| A **cancelled** enrollment exists | `200 OK` | the row is re-activated, no second row is created |
| The Course Service cannot be reached | `503 Service Unavailable` | `CourseServiceUnavailableException` |

The enrollment response carries only identifiers. The course details are read
from the catalogue of the Student Service.

---

## 6. Error bodies that the client understands

`src/api/errors.ts` normalises all of these into one `ApiError`:

| Shape | Source |
| --- | --- |
| `{ timestamp, status, message }` | `ResponseStatusException` of the Student Service, `ApiExceptionHandler` of the Identity Service |
| `{ error: "NOT_FOUND" \| "CONFLICT" \| "UNAUTHORIZED" \| "FORBIDDEN", message }` | `ApiExceptionHandler` |
| `{ error: "VALIDATION_FAILED", fields: { "<field>": "<message>" } }` | `MethodArgumentNotValidException` (HTTP 400) |
| `{ error: "UNAUTHORIZED", message }` | `JwtAuthenticationFilter` |
| `{ type, title, status, detail }` | RFC 7807 problem detail of the Course Service |
| empty body | Spring Security entry point (401) / access denied handler (403) |

Status codes and the message the interface shows:

| Status | Message |
| --- | --- |
| 400 | The field errors are mapped onto the matching inputs |
| 401 | The session is cleared, the login page shows "your session has expired" |
| 403 | "Access denied" - the session stays active |
| 404 | "The requested resource was not found." |
| 409 | "You are already enrolled in this course." (enrollment) |
| 422 | "This course is not currently open for enrollment." |
| 500 / 502 / 503 / 504 | A readable, non-leaking message |
| network error | "Unable to reach the … Service at …" |

---

## 7. Known gaps in the backend

These gaps are **not** worked around in the frontend. They are reported
instead, because fixing them requires a backend change.

### 7.1 No permission is mapped to a role

`V2__seed_initial_rbac.sql` inserts the roles and the permissions but **no
`role_permissions` rows**. Two consequences:

1. `GET /api/admin/users` (`USER_READ`), `GET /api/admin/roles`
   (`PERMISSION_MANAGE`), … answer with `403` for **every** account, including
   an administrator.
2. `GET /api/courses` of the Course Service requires `COURSE_READ`, which is
   **not seeded at all** - the permission does not even exist in the database.

The smallest fix would be a third migration of the Identity Service that
inserts the `COURSE_*` permissions and the role mappings, for example
`STUDENT -> COURSE_READ` and `ADMIN -> COURSE_READ|COURSE_CREATE|
COURSE_UPDATE|COURSE_DELETE|USER_READ|PERMISSION_MANAGE`. The frontend already
behaves correctly for both cases: the links follow the reported authorities and
the pages show "access denied" instead of fake data.

### 7.2 The Student Service needs the `COURSE_READ` authority as well

`CourseCatalogService` forwards the read to the Course Service with the token
of the caller. Without `COURSE_READ` the Student Service answers with `502`
("Course Service rejected the request: 403"). The Student Service can be
configured with a service token (`app.course-service.token`) that belongs to an
account with `COURSE_READ`.

### 7.3 No parent accounts

There is no `PARENT` role, no parent to student relationship and no endpoint
that would return the data of a linked student. The parent dashboard reports
that instead of simulating data.

### 7.4 No teaching specific endpoints

The `TEACHER` role exists, but no endpoint exposes classes, rosters,
assignments or grades. The faculty dashboard reports that instead of
fabricating it.

### 7.5 The API Gateway does not route every endpoint

`GatewayRoutesConfig` routes `/api/auth/**`, `/api/courses/**`,
`/api/students/**` and `/api/enrollments/**`. Two path families of the
Identity Service are missing:

| Missing route | Endpoint | Effect in gateway mode |
| --- | --- | --- |
| `/api/admin/**` | `GET /api/admin/users`, `/api/admin/roles`, `/api/admin/permissions` | The administration panels answer with HTTP 404 |
| `/api/rbac-test/**` | `GET /api/rbac-test/users`, `/api/rbac-test/permission-management` | The access check answers with HTTP 404 |

The smallest change is two more routes in
`com.olympiad.gateway.GatewayRoutesConfig`:

```java
// Administration endpoints of the Identity Service
.route("admin-service", route -> route
    .path("/api/admin/**")
    .uri(identityUrl))

// Diagnostic endpoints of the Identity Service
.route("rbac-test-service", route -> route
    .path("/api/rbac-test/**")
    .uri(identityUrl))
```

Until then the frontend uses the direct service URLs, which is the default in
`.env.example` and `.env.local`. Gateway mode is implemented and works for
every routed endpoint; it shows a banner that names the two missing route
families.

### 7.6 The course catalogue has two different page wrappers

`/api/courses` is served by two different backends:

| Situation | Backend | Response |
| --- | --- | --- |
| Direct service URL (`http://localhost:8082/api/courses`) | Student Service | `CoursePageResponse` with the field `page` |
| Gateway (`http://localhost:8088/api/courses`) | Course Service | Spring Data `Page` with the field `number` |

`src/api/catalogApi.ts` normalises both into one `CatalogPage`, so the
catalogue renders identically in both modes. The frontend also sends
`status=PUBLISHED` explicitly, because the Student Service defaults to
`PUBLISHED` while the Course Service returns every status when no status is
given.
