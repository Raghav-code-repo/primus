# 02 - Authentication & Authorization

## 2.1 Token storage

Single source of truth: `src/auth/tokenStorage.ts:1-119`.

- Strategy: in-memory `memorySession` + mirrored `sessionStorage` under key `ola.auth.session` (`tokenStorage.ts:22-23`).
- `getSession()` (`tokenStorage.ts:85-94`) returns memory first, then falls back to persisted.
- `setSession()` (`tokenStorage.ts:96-99`) writes both; `clearSession()` (`tokenStorage.ts:101-104`) clears both.
- `getAccessToken()` (`tokenStorage.ts:106-115`) returns `null` when the session is expired (`isExpired` at `tokenStorage.ts:117-119`).
- No JWT decoding occurs anywhere in the codebase. Expiry comes from the `expiresIn` field of the auth response.

## 2.2 Auth provider

`src/auth/AuthProvider.tsx:33-258`.

- State: `status` (`initializing` | `authenticated` | `unauthenticated`), `user`, `authorities`, `authoritiesError`, `sessionExpired`.
- On mount (`useEffect` at `AuthProvider.tsx:78-128`):
  1. Reads stored session; if missing or expired → `unauthenticated`.
  2. Otherwise calls `api.me()` (single-flight via `restoreRequest` ref).
  3. **Before** announcing the session, calls `loadAuthorities()` (`AuthProvider.tsx:55-76`) so a rejected token never flashes a protected page.
  4. On success → `authenticated`; on 401 → `clearLocalSession()` + `setSessionExpired(true)`.
- `login()` (`AuthProvider.tsx:165-171`), `register()` (`AuthProvider.tsx:173-184`), `logout()` (`AuthProvider.tsx:186-189`).
- `establishSession()` (`AuthProvider.tsx:138-163`) sets the token, then calls `api.me()` + `loadAuthorities()`.
- 401 handler: `setUnauthorizedHandler` registered at `AuthProvider.tsx:130-136`, cleared on unmount.

## 2.3 Roles

`src/auth/roles.ts:1-65`.

Constants: `ROLE_ADMIN = 'ADMIN'`, `ROLE_TEACHER = 'TEACHER'`, `ROLE_STUDENT = 'STUDENT'`, `ROLE_PARENT = 'PARENT'` (declared but not seeded).
Helpers: `normalizeRole`, `hasRole`, `isAdmin`, `isStudent`, `isTeacher`, `isParent`.

## 2.4 Permissions

`src/auth/permissions.ts:1-126`.

Constants:
- `PERMISSION_COURSE_READ/CREATE/UPDATE/DELETE`
- `PERMISSION_LIVE_CLASS_READ/CREATE/UPDATE/CANCEL/JOIN`

Helpers: `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `hasRole` (authority form), `splitAuthorities`.

## 2.5 Route guards

`src/auth/ProtectedRoute.tsx:1-101`.

- `ProtectedRoute` — `initializing` → LoadingScreen; `unauthenticated` → redirect to `/login` with `from` state.
- `PublicOnlyRoute` — authenticated → redirect to `/dashboard`.
- `RequireRole` — checks `roles` only (no status); redirects to `/unauthorized`.
- `RequirePermission` — checks `hasPermission`; also shows LoadingScreen while `initializing`.

## 2.6 Inline guards

`src/auth/PermissionGuard.tsx:1-50` — `PermissionGuard` (renders children or fallback) and `RoleGuard`.

## 2.7 Observations / assumptions

- **Confirmed:** Frontend guards are usability features only; the backend enforces every request (`ProtectedRoute.tsx:62-65`, `PermissionGuard.tsx:17-19`, `navigation.ts:19-21`).
- **Confirmed:** `RequireRole` does **not** wait for `initializing`, unlike `RequirePermission`. This can briefly flash an unauthorized redirect on role-gated routes while the session restores (`AppRoutes.tsx:202-227`).
- **Assumption:** `GET /api/auth/permissions` returns Spring Security authorities (`ROLE_*` + permission codes). `permissions.ts:4-15` documents this.
- **Confirmed gap:** Seed migrations map no permissions to roles until an admin uses the RBAC API (`README.md:246-251`). `AdminDashboardPage.tsx:207-213` surfaces this.