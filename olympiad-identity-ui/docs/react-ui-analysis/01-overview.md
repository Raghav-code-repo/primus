# 01 - Application Overview

**Scope:** READ-ONLY analysis of `D:\ws\olympiad-identity-ui`. No application code was modified.

## 1.1 Package identity

- `package.json` (`D:\ws\olympiad-identity-ui\package.json`)
  - name `olympiad-identity-ui`, version `0.0.0`, `"type": "module"`, private.
  - Scripts: `dev` (vite), `build` (`tsc -b && vite build`), `lint`, `typecheck`, `test` (vitest run), `test:watch`, `preview`.
  - Runtime deps: React 19, react-router-dom 7, axios, react-hook-form + @hookform/resolvers, zod, Tailwind 4 (+ postcss), lucide-react, @livekit/components-react + livekit-client, @stomp/stompjs.
  - Dev deps: vitest, jsdom, @testing-library/*, typescript ~6, typescript-eslint, eslint, vite 8, @vitejs/plugin-react.

## 1.2 Toolchain / build config

- `vite.config.ts:1-15` — dev server + vitest config. Test env `jsdom`, `setupFiles: ['./src/test/setup.ts']`, `css: false`, `restoreMocks: true`, `include: ['src/**/*.{test,spec}.{ts,tsx}']`.
- `tsconfig.json:1-7` — project references to `tsconfig.app.json` and `tsconfig.node.json` (composite build).
- `postcss.config.js:1` — `{ plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} } }`.
- `tailwind.config.js:1-6` — content globs `./index.html`, `./src/**/*.{ts,tsx}`; no custom theme extensions, no plugins.

## 1.3 Source layout (confirmed by file listing)

```
src/
  main.tsx                 entry, mounts <ThemeProvider><App/></Provider>
  App.tsx                  AuthProvider > BrowserRouter > ToastProvider > AppRoutes
  routes/AppRoutes.tsx     all routes, lazy-loaded pages
  auth/                    AuthContext, AuthProvider, ProtectedRoute, roles, permissions, tokenStorage
  api/                     client.ts, errors.ts, *Api.ts, classroomApi.ts
  config/                  apiConfig.ts, navigation.ts
  hooks/                   useAsyncResource, useCatalog, useCourseList, useMyEnrollments, useStudentProfile, useTeachers, useToast
  pages/                   one component per screen (+ __tests__)
  components/              shared UI, ui/* primitives, classroom/*, dashboard/*
  theme/                   ThemeProvider, ThemeContext, themeStorage, useTheme
  types/                   auth, course, student, content, classroom
  validation/               zod schemas
  utils/                   enrollmentMessages
  styles/                  8 CSS files
  test/                    setup.ts, utils.tsx, studentServiceMock.ts
```

## 1.4 Backend contract (from README + code comments)

Four backend services are referenced:

| Service | Default URL | Responsibility |
|---|---|---|
| Identity Service | `http://localhost:8080` | registration, login, JWT, roles & permissions |
| Course Service | `http://localhost:8081` | courses / course management |
| Student Service | `http://localhost:8082` | student profile, course catalogue, enrollments |
| API Gateway | `http://localhost:8088` | routes services by API path |

Source: `README.md:6-11`, `src/config/apiConfig.ts:35-41`.

## 1.5 Observations / assumptions

- **Assumption:** The backend is stateless, issues a bearer JWT in the JSON body, sets no cookie, and exposes no refresh/revocation endpoint. Stated in `README.md:180-183` and implemented in `src/auth/tokenStorage.ts:1-20`.
- **Assumption:** Spring Security authorities are built as `ROLE_<role>` server-side; the profile endpoint returns raw role names (`STUDENT`, `TEACHER`, `ADMIN`). `src/auth/roles.ts:8-12` documents both shapes and `normalizeRole` accepts either.
- **Confirmed gap:** Seed migrations do not map any permission to a role until an admin uses the RBAC API (`README.md:246-251`). Frontend renders "access denied" rather than inventing data.
- **Confirmed gap:** `ROLE_PARENT` is declared (`src/auth/roles.ts:24`) but the backend does not seed it; `ParentDashboardPage.tsx:32-35` explicitly states "Coming soon".
- **Confirmed gap:** The API Gateway does not route `/api/admin/**` and `/api/rbac-test/**` (`README.md:99-104`).