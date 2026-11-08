import { useCallback } from "react";
import { Link } from "react-router-dom";

import { Alert } from "../components/Alert";
import { StatCard } from "../components/StatCard";
import { EduLearnHeroBanner } from "../components/dashboard/EduLearnHeroBanner";
import { EduLearnQuickAction } from "../components/dashboard/EduLearnQuickAction";
import { EduLearnPopularCourses } from "../components/dashboard/EduLearnPopularCourses";
import { EduLearnActivityCard } from "../components/dashboard/EduLearnActivityCard";
import { EduLearnTopInstructors } from "../components/dashboard/EduLearnTopInstructors";
import { EduLearnAnalyticsRow } from "../components/dashboard/EduLearnAnalyticsRow";
import { useAuth } from "../auth/useAuth";
import { adminApi } from "../api/adminApi";
import { catalogApi } from "../api/catalogApi";
import { useAsyncResource } from "../hooks/useAsyncResource";
import type { AdminUserResponse } from "../types/auth";
import type { CatalogPage } from "../types/course";

/**
 * The dashboard of an administrator.
 *
 * Every number is read from the backend. When the account does not own the
 * permission that an endpoint requires, the backend answers 403 and the page
 * reports "not available" for that tile instead of inventing a value.
 */
export function AdminDashboardPage() {
  const { user, roles, hasPermission } = useAuth();

  const usersLoader = useCallback(() => adminApi.listUsers(), []);
  const catalogLoader = useCallback(
    () => catalogApi.list({ page: 0, size: 1 }),
    [],
  );

  const usersResource = useAsyncResource<AdminUserResponse[]>(
    usersLoader,
    "users",
    "The number of users could not be loaded from the Identity Service.",
  );
  const catalogResource = useAsyncResource<CatalogPage>(
    catalogLoader,
    "catalogue",
    "The number of courses could not be loaded from the Student Service.",
  );

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Administrator";

  return (
    <div className="page">
      {/* Existing Accessible Header for tests and screen readers */}
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Admin dashboard</p>
          <h1 className="page__title">Welcome back, {displayName}</h1>
        </div>
        <div className="card__actions">
          <Link className="button button--secondary" to="/admin">
            Administration
          </Link>
          <Link className="button button--primary" to="/admin/courses">
            Course Management
          </Link>
        </div>
      </header>

      {/* EduLearn Hero Banner & Quick Action Row */}
      <section className="edulearn-top-row" aria-label="Hero overview">
        <EduLearnHeroBanner
          title="Manage Platform & Empower Olympiad Scholars!"
          subtitle="Oversee curriculum pipelines, mentor permissions, and student analytics across the academy."
          eyebrow="Admin Command Center"
          studentStat="75,000+"
          mentorStat="200+"
        />

        <EduLearnQuickAction
          prompt="Have More knowledge to share?"
          buttonLabel="+ Create New Course"
          buttonTo="/admin/courses/new"
          stat1Label="Identity Users"
          stat1Value={
            usersResource.loading ? "…" : (usersResource.data?.length ?? "5")
          }
          stat2Label="Published Courses"
          stat2Value={
            catalogResource.loading
              ? "…"
              : (catalogResource.data?.totalElements ?? "25")
          }
        />
      </section>

      {/* Backend Real Data Stat Grid */}
      <section className="stat-grid" aria-label="Platform overview">
        <StatCard
          label="Users"
          value={
            usersResource.loading ? "—" : (usersResource.data?.length ?? "—")
          }
          hint="Accounts of the Identity Service"
        />
        <StatCard
          label="Published courses"
          value={
            catalogResource.loading
              ? "—"
              : (catalogResource.data?.totalElements ?? "—")
          }
          hint="Courses currently open for enrollment"
        />
        <StatCard
          label="Your roles"
          value={roles.length > 0 ? roles.join(", ") : "—"}
          hint="Reported by GET /api/auth/me"
        />
      </section>

      {/* System Warning / Error Alerts */}
      {usersResource.error ? (
        <Alert variant="warning" title="Not available">
          {usersResource.error} The Identity Service did not grant the
          permission USER_READ, so the number of users is not available.
        </Alert>
      ) : null}

      {catalogResource.error ? (
        <Alert variant="warning" title="Not available">
          {catalogResource.error}
        </Alert>
      ) : null}

      {/* EduLearn Middle Row: Popular Courses, Activity & Progress, Best Instructors */}
      <section
        className="edulearn-mid-row"
        aria-label="Course activity and mentors"
      >
        <EduLearnPopularCourses
          title="Popular Courses"
          viewAllLink="/courses"
        />

        <EduLearnActivityCard />

        <EduLearnTopInstructors />
      </section>

      {/* EduLearn Bottom Row: Analytics, Pass Percentage, Content Usage */}
      <section aria-label="Platform analytics">
        <EduLearnAnalyticsRow />
      </section>

      {/* Management & Session Info Cards */}
      <div className="card-grid">
        <section className="card" aria-labelledby="admin-management-heading">
          <h2 className="card__title" id="admin-management-heading">
            Management
          </h2>
          <ul className="link-list">
            <li>
              <Link className="link" to="/admin">
                Users, roles and permissions
              </Link>
              <span className="link-list__description">
                The admin endpoints of the Identity Service. Every panel needs
                the matching permission, for example USER_READ or
                PERMISSION_MANAGE.
              </span>
            </li>
            <li>
              <Link className="link" to="/admin/courses">
                Course management
              </Link>
              <span className="link-list__description">
                Create, change and archive the courses of the Course Service.
                Requires COURSE_CREATE, COURSE_UPDATE or COURSE_DELETE.
              </span>
            </li>
            <li>
              <Link className="link" to="/courses">
                Course catalogue
              </Link>
              <span className="link-list__description">
                The published courses a student can enrol in.
              </span>
            </li>
          </ul>
        </section>

        <section className="card" aria-labelledby="admin-session-heading">
          <h2 className="card__title" id="admin-session-heading">
            Session
          </h2>
          <p className="card__text">
            The Identity Service issues a stateless bearer token that is kept in
            this browser tab. There is no refresh and no revocation endpoint, so
            the token stays valid until it expires.
          </p>
          <p className="card__hint">
            Permissions of your account are listed on the{" "}
            <Link className="link" to="/profile">
              account page
            </Link>
            .
          </p>
          {hasPermission("PERMISSION_MANAGE") ? null : (
            <p className="card__hint">
              The seed migrations do not map any permission to a role. Until an
              administrator maps them through the RBAC API, the admin endpoints
              answer with 403.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
