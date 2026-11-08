# Authentication and RBAC

## Login/Register Flow
- Forms in LoginPage/RegisterPage use authSchemas (Zod). Call authApi.login/register (Identity Service via apiClient).
- AuthProvider.establishSession stores token (tokenStorage) and loads profile + authorities.

## JWT Storage
- sessionStorage (key ola.auth.session) + in-memory. Token expiresAt from expiresIn. No refresh endpoint. Logout clears session. See src/auth/tokenStorage.ts.

## Axios Interceptors
- client.ts createApiClient adds Authorization header (except public paths /api/auth/login, /api/auth/register). On 401 with authenticated request, calls unauthorizedHandler -> clear session + sessionExpired.

## Role/Permission Checks
- roles.ts: ROLE_ADMIN/TEACHER/STUDENT/PARENT. hasRole on profile roles.
- permissions.ts: authorities from GET /api/auth/permissions. hasPermission/hasAnyPermission/hasAllPermissions.
- ProtectedRoute, PublicOnlyRoute, RequireRole, RequirePermission in src/auth/ProtectedRoute.tsx.

## Identity Service Integration
- api.me() GET /api/auth/me; api.permissions() GET /api/auth/permissions; login/register POST. Base URL from apiConfig (gateway 8088 or identity 8080).
