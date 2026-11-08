# Application Overview

## Purpose
React + TypeScript SPA for an Online Math & Science Olympiad Tutoring Platform. Provides auth, course catalog, student/faculty/admin dashboards, course management, content management, live classes (LiveKit), and profiles.

## Tech Stack
- React 18 + TypeScript (strict)
- Vite
- React Router v6
- Axios
- React Hook Form + Zod
- Tailwind CSS
- LiveKit client (live classes)
- Vitest (tests)

## Entry Point
- `index.html` -> `src/main.tsx` renders `<ThemeProvider><App/></ThemeProvider>` into `#root`.
- `src/App.tsx` wraps AuthProvider -> BrowserRouter -> ToastProvider -> AppRoutes.

## Init Flow
1. ThemeProvider applies theme from storage.
2. AuthProvider initial status: `initialStatus()` reads sessionStorage; if token present and not expired -> 'initializing', else 'unauthenticated'.
3. On mount, restores session via `api.me()`, loads authorities via `api.permissions()`.
4. Unauthorized handler registered to clear session on 401.

## Route Config
See `src/routes/AppRoutes.tsx`. Public: /login, /register. Protected layout: AppLayout. Role/permission guards: RequireRole, RequirePermission. Lazy-loaded pages with Suspense + LoadingScreen.
