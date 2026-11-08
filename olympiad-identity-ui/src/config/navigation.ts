import { isAdmin, isStudent, isTeacher, isParent } from "../auth/roles";
import {
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_DELETE,
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_UPDATE,
  PERMISSION_LIVE_CLASS_CREATE,
  PERMISSION_LIVE_CLASS_READ,
} from "../auth/permissions";

/**
 * The navigation of the signed-in account.
 *
 * Every entry is derived from the identity that the Identity Service reported
 * (`GET /api/auth/me` for the roles, `GET /api/auth/permissions` for the
 * authorities). The browser never sends a role or a permission, so a link can
 * only appear when the backend itself reports it for this account.
 *
 * A hidden link is a usability feature only. Every protected page and every
 * protected action is checked again by the backend.
 */

export interface NavigationItem {
  label: string;
  to: string;
  /** Matches the active route exactly or as a prefix. */
  end?: boolean;
}

export interface NavigationOptions {
  roles: readonly string[];
  hasPermission: (permission: string) => boolean;
}

/**
 * Builds the primary navigation of the signed-in account.
 */
export function buildNavigation({
  roles,
  hasPermission,
}: NavigationOptions): NavigationItem[] {
  const items: NavigationItem[] = [
    { label: "Dashboard", to: "/dashboard", end: true },
  ];

  if (isStudent(roles)) {
    items.push(
      { label: "My Profile", to: "/student/profile" },
      { label: "Academic Catalogue", to: "/admin/catalogue" },
      { label: "Course Catalogue", to: "/courses" },
      { label: "My Courses", to: "/student/courses" },
    );
  }

  const canManageCourses =
    hasPermission(PERMISSION_COURSE_CREATE) ||
    hasPermission(PERMISSION_COURSE_UPDATE) ||
    hasPermission(PERMISSION_COURSE_DELETE) ||
    hasPermission(PERMISSION_COURSE_READ);

  const canManageLiveClasses =
    hasPermission(PERMISSION_LIVE_CLASS_CREATE) ||
    hasPermission(PERMISSION_LIVE_CLASS_READ);

  if (!isStudent(roles)) {
    // The catalogue is the student-facing view.
    items.push({ label: "Course Catalogue", to: "/courses" });
  }

  if (canManageCourses) {
    items.push({
      label: "Course Management",
      to: "/admin/courses",
    });
  }

  if (canManageLiveClasses) {
    items.push({
      label: "Live Classes",
      to: "/live-classes",
    });

    if (hasPermission(PERMISSION_LIVE_CLASS_CREATE)) {
      items.push({
        label: "Create Live Class",
        to: "/live-classes/create",
      });
    }
  }

  if (isAdmin(roles)) {
    items.push(
      {
        label: "Content Management",
        to: "/admin/content",
      },
      // {
      //   label: "Administration",
      //   to: "/admin",
      // },
      {
        label: "Users",
        to: "/admin/users",
      },
      {
        label: "Roles",
        to: "/admin/roles",
      },
      {
        label: "Permissions",
        to: "/admin/permissions",
      },
      // {
      //   label: "Access",
      //   to: "/admin/access",
      // },
    );
  }

  items.push({ label: "Account", to: "/profile" });

  return items;
}

/**
 * The route of the dashboard that matches the roles of the account.
 * `null` means that the account holds no role the backend knows about.
 */
export function dashboardRouteForRoles(
  roles: readonly string[] | undefined | null,
): string | null {
  if (isAdmin(roles)) {
    return "/admin/dashboard";
  }

  if (isTeacher(roles)) {
    return "/faculty/dashboard";
  }

  if (isStudent(roles)) {
    return "/student/dashboard";
  }

  if (isParent(roles)) {
    return "/parent/dashboard";
  }

  return null;
}
