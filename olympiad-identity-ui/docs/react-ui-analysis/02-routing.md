# 02 - Routing & Application Shell

## 2.1 Entry points

- `src/main.tsx:1-21` — `createRoot(...).render(<StrictMode><ThemeProvider><App/></ThemeProvider></StrictMode>)`. Imports 6 CSS files (`index`, `layout`, `components`, `pages`, `academy`, `olympiad-banner`, `dashboard`, `classroom`).
- `src/App.tsx:1-19` — wraps everything: `AuthProvider` → `BrowserRouter` → `ToastProvider` → `AppRoutes`.

## 2.2 Route table

Source: `src/routes/AppRoutes.tsx:163-363`.

| Method | Path | Element | Guard |
|---|---|---|---|
| redirect | `/` | `<Navigate to="/dashboard" replace" />` | — |
| GET | `/login` | `LoginPage` | `PublicOnlyRoute` |
| GET | `/register` | `RegisterPage` | `PublicOnlyRoute` |
| (layout) | `*` | `AppLayout` | `ProtectedRoute` |
| nested | `/dashboard` | `DashboardPage` | — |
| nested | `/student/dashboard` | `StudentDashboardPage` | `RequireRole(ROLE_STUDENT)` |
| nested | `/student/profile` | `StudentProfilePage` | `RequireRole(ROLE_STUDENT)` |
| nested | `/student/courses` | `MyCoursesPage` | `RequireRole(ROLE_STUDENT)` |
| nested | `/faculty/dashboard` | `FacultyDashboardPage` | `RequireRole(ROLE_TEACHER)` |
| nested | `/parent/dashboard` | `ParentDashboardPage` | none |
| nested | `/admin/dashboard` | `AdminDashboardPage` | `RequireRole(ROLE_ADMIN)` |
| nested | `/courses` | `CourseCataloguePage` | none |
| nested | `/courses/:id` | `CourseCatalogueDetailPage` | none |
| nested | `/profile` | `ProfilePage` | none |
| nested | `/admin` | `AdminPage` | `RequireRole(ROLE_ADMIN)` |
| nested | `/admin/courses` | `CourseManagementPage` | `RequirePermission(COURSE_READ)` |
| nested | `/admin/courses/new` | `CourseFormPage mode="create"` | `RequirePermission(COURSE_CREATE)` |
| nested | `/admin/courses/:id` | `CourseManagementDetailPage` | `RequirePermission(COURSE_READ)` |
| nested | `/admin/courses/:id/edit` | `CourseFormPage mode="edit"` | `RequirePermission(COURSE_UPDATE)` |
| nested | `/admin/content` | `ContentManagementPage` | `RequireRole(ROLE_ADMIN)` |
| nested | `/live-classes` | `LiveClassesPage` | `RequirePermission(LIVE_CLASS_READ)` |
| nested | `/live-classes/:id/room` | `LiveClassRoomPage` | `RequirePermission(LIVE_CLASS_JOIN)` |
| nested | `/live-classes/create` | `CreateLiveClassPage` | `RequirePermission(LIVE_CLASS_CREATE)` |
| nested | `/live-classes/:id/edit` | `CreateLiveClassPage` | `RequirePermission(LIVE_CLASS_UPDATE)` |
| sibling | `/unauthorized` | `UnauthorizedPage` | none |
| fallback | `*` | `NotFoundPage` | none |

## 2.3 Code-splitting

All pages except `LoginPage` and `RegisterPage` are wrapped in `lazy(...)` (`AppRoutes.tsx:32-156`). The whole tree is wrapped in `<Suspense fallback={<LoadingScreen label="Loading the page" />}>` (`AppRoutes.tsx:165`).

## 2.4 Layout shell

- `src/components/AppLayout.tsx:10-42` — `<Navbar/>` + `<main>` (renders `configurationIssues`/`configurationWarnings` alerts) + `<footer>`.
- `src/components/Navbar.tsx:18-99` — builds navigation via `buildNavigation({ roles, hasPermission })` (`Navbar.tsx:30`), renders user name + roles, logout button, theme toggle, mobile hamburger.
- `src/components/AuthLayout.tsx:20-55` — used by login/register: left card + right `OlympiadPromoBanner`.

## 2.5 Observations / assumptions

- **Assumption:** `ContentManagementPage` is imported without `.then(module => ...)` (`AppRoutes.tsx:118-120`), so it **must** use a default export. Confirmed: `src/pages/ContentManagementPage.tsx:38` `export default function ContentManagementPage()`.
- **Confirmed oddity:** `/live-classes/:id/edit` reuses `CreateLiveClassPage` (`AppRoutes.tsx:348-354`). The component itself detects edit mode via `useParams().id` (`CreateLiveClassPage.tsx:40-42`).
- **Confirmed:** `RequireRole` and `RequirePermission` are **frontend-only** guards; the backend remains the authority (`ProtectedRoute.tsx:62-65`, `81-85`).
- **Confirmed:** `RequirePermission` shows `LoadingScreen` while `status === 'initializing'` (`ProtectedRoute.tsx:92-94`), `RequireRole` does **not** (it only checks `roles`, no status check) — potential flash of redirect for unauthenticated users on role-gated routes. This is an observation, not a bug report.