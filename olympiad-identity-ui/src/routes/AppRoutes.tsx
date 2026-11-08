import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";
import { LoadingScreen } from "../components/LoadingScreen";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

import {
  ProtectedRoute,
  PublicOnlyRoute,
  RequirePermission,
  RequireRole,
} from "../auth/ProtectedRoute";

import { ROLE_ADMIN, ROLE_STUDENT, ROLE_TEACHER } from "../auth/roles";

import {
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_UPDATE,
  PERMISSION_LIVE_CLASS_CREATE,
  PERMISSION_LIVE_CLASS_READ,
  PERMISSION_LIVE_CLASS_UPDATE,
  PERMISSION_USER_READ,
PERMISSION_LIVE_CLASS_JOIN,
PERMISSION_MANAGE,
} from "../auth/permissions";

/**
 * Pages are loaded on demand to keep the initial application bundle small.
 */

const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);

const StudentDashboardPage = lazy(() =>
  import("../pages/StudentDashboardPage").then((module) => ({
    default: module.StudentDashboardPage,
  })),
);

const FacultyDashboardPage = lazy(() =>
  import("../pages/FacultyDashboardPage").then((module) => ({
    default: module.FacultyDashboardPage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import("../pages/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);

const ParentDashboardPage = lazy(() =>
  import("../pages/ParentDashboardPage").then((module) => ({
    default: module.ParentDashboardPage,
  })),
);

const StudentProfilePage = lazy(() =>
  import("../pages/StudentProfilePage").then((module) => ({
    default: module.StudentProfilePage,
  })),
);

const MyCoursesPage = lazy(() =>
  import("../pages/MyCoursesPage").then((module) => ({
    default: module.MyCoursesPage,
  })),
);

const CourseCataloguePage = lazy(() =>
  import("../pages/CourseCataloguePage").then((module) => ({
    default: module.CourseCataloguePage,
  })),
);

const CourseCatalogueDetailPage = lazy(() =>
  import("../pages/CourseCatalogueDetailPage").then((module) => ({
    default: module.CourseCatalogueDetailPage,
  })),
);

const CourseManagementPage = lazy(() =>
  import("../pages/CourseManagementPage").then((module) => ({
    default: module.CourseManagementPage,
  })),
);

const CourseManagementDetailPage = lazy(() =>
  import("../pages/CourseManagementDetailPage").then((module) => ({
    default: module.CourseManagementDetailPage,
  })),
);

const CourseFormPage = lazy(() =>
  import("../pages/CourseFormPage").then((module) => ({
    default: module.CourseFormPage,
  })),
);

const AdminPage = lazy(() =>
  import("../pages/AdminPage").then((module) => ({
    default: module.AdminPage,
  })),
);

const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminRolesPage = lazy(() => import("../pages/AdminRolesPage").then(m => ({ default: m.AdminRolesPage })));
const AdminPermissionsPage = lazy(() => import("../pages/AdminPermissionsPage").then(m => ({ default: m.AdminPermissionsPage })));
const AdminAccessPage = lazy(() => import("../pages/AdminAccessPage").then(m => ({ default: m.AdminAccessPage })));

/**
 * Content Management page.
 *
 * File:
 * src/pages/ContentManagementPage.tsx
 *
 * This page must use a default export.
 */
const ContentManagementPage = lazy(
  () => import("../pages/ContentManagementPage"),
);

const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

const UnauthorizedPage = lazy(() =>
  import("../pages/UnauthorizedPage").then((module) => ({
    default: module.UnauthorizedPage,
  })),
);

const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);

const LiveClassesPage = lazy(() =>
  import("../pages/LiveClassesPage").then((module) => ({
    default: module.LiveClassesPage,
  })),
);

const LiveClassRoomPage = lazy(() =>
  import("../pages/LiveClassRoomPage").then((module) => ({
    default: module.LiveClassRoomPage,
  })),
);

const CreateLiveClassPage = lazy(() =>
  import("../pages/CreateLiveClassPage").then((module) => ({
    default: module.CreateLiveClassPage,
  })),
);

/**
 * Application routes.
 *
 * Protected routes use the existing authentication and RBAC guards.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading the page" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public routes */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Authenticated application layout */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Student routes */}

          <Route
            path="/student/dashboard"
            element={
              <RequireRole role={ROLE_STUDENT}>
                <StudentDashboardPage />
              </RequireRole>
            }
          />

          <Route
            path="/student/profile"
            element={
              <RequireRole role={ROLE_STUDENT}>
                <StudentProfilePage />
              </RequireRole>
            }
          />

          <Route
            path="/student/courses"
            element={
              <RequireRole role={ROLE_STUDENT}>
                <MyCoursesPage />
              </RequireRole>
            }
          />

          {/* Faculty and parent routes */}

          <Route
            path="/faculty/dashboard"
            element={
              <RequireRole role={ROLE_TEACHER}>
                <FacultyDashboardPage />
              </RequireRole>
            }
          />

          <Route path="/parent/dashboard" element={<ParentDashboardPage />} />

          {/* Administrator dashboard */}

          <Route
            path="/admin/dashboard"
            element={
              <RequireRole role={ROLE_ADMIN}>
                <AdminDashboardPage />
              </RequireRole>
            }
          />

          {/* Course catalogue and profile */}

          <Route path="/courses" element={<CourseCataloguePage />} />

          <Route path="/courses/:id" element={<CourseCatalogueDetailPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          {/* Administration */}

          <Route
            path="/admin"
            element={
              <RequireRole role={ROLE_ADMIN}>
                <AdminPage />
              </RequireRole>
            }
          />

          <Route path="/admin/users" element={<RequirePermission permission={PERMISSION_USER_READ}><AdminUsersPage /></RequirePermission>} />
          <Route path="/admin/roles" element={<RequirePermission permission={PERMISSION_MANAGE}><AdminRolesPage /></RequirePermission>} />
          <Route path="/admin/permissions" element={<RequirePermission permission={PERMISSION_MANAGE}><AdminPermissionsPage /></RequirePermission>} />
          <Route path="/admin/access" element={<AdminAccessPage />} />

          {/* Course management */}

          <Route
            path="/admin/courses"
            element={
              <RequirePermission permission={PERMISSION_COURSE_READ}>
                <CourseManagementPage />
              </RequirePermission>
            }
          />

          <Route
            path="/admin/courses/new"
            element={
              <RequirePermission permission={PERMISSION_COURSE_CREATE}>
                <CourseFormPage mode="create" />
              </RequirePermission>
            }
          />

          <Route
            path="/admin/courses/:id"
            element={
              <RequirePermission permission={PERMISSION_COURSE_READ}>
                <CourseManagementDetailPage />
              </RequirePermission>
            }
          />

          <Route
            path="/admin/courses/:id/edit"
            element={
              <RequirePermission permission={PERMISSION_COURSE_UPDATE}>
                <CourseFormPage mode="edit" />
              </RequirePermission>
            }
          />

          {/* Content management */}

          <Route
            path="/admin/content"
            element={
              <RequireRole role={ROLE_ADMIN}>
                <ContentManagementPage />
              </RequireRole>
            }
          />
        </Route>

          {/* Live Classes */}

          <Route
            path="/live-classes"
            element={
              <RequirePermission permission={PERMISSION_LIVE_CLASS_READ}>
                <LiveClassesPage />
              </RequirePermission>
            }
          />
          <Route
            path="/live-classes/:id/room"
            element={
              <RequirePermission permission={PERMISSION_LIVE_CLASS_JOIN}>
                <LiveClassRoomPage />
              </RequirePermission>
            }
          />
          <Route
            path="/live-classes/create"
            element={
              <RequirePermission permission={PERMISSION_LIVE_CLASS_CREATE}>
                <CreateLiveClassPage />
              </RequirePermission>
            }
          />
          <Route
            path="/live-classes/:id/edit"
            element={
              <RequirePermission permission={PERMISSION_LIVE_CLASS_UPDATE}>
                <CreateLiveClassPage />
              </RequirePermission>
            }
          />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
