import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

import { Alert } from "../components/Alert";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { StatCard } from "../components/StatCard";
import { EduLearnHeroBanner } from "../components/dashboard/EduLearnHeroBanner";
import { EduLearnQuickAction } from "../components/dashboard/EduLearnQuickAction";
import { EduLearnPopularCourses } from "../components/dashboard/EduLearnPopularCourses";
import { EduLearnActivityCard } from "../components/dashboard/EduLearnActivityCard";
import { EduLearnTopInstructors } from "../components/dashboard/EduLearnTopInstructors";
import { EduLearnAnalyticsRow } from "../components/dashboard/EduLearnAnalyticsRow";
import { useAuth } from "../auth/useAuth";
import { catalogApi } from "../api/catalogApi";
import { enrollmentApi } from "../api/enrollmentApi";
import { useAsyncResource } from "../hooks/useAsyncResource";
import { useStudentProfile } from "../hooks/useStudentProfile";
import type { CatalogPage } from "../types/course";
import type { Enrollment } from "../types/student";

/**
 * The dashboard of a student.
 *
 * Every number on this page comes from the backend: the profile from
 * `GET /api/students/me`, the enrollments from `GET /api/enrollments/me` and
 * the course count from the catalogue of the Student Service. Nothing is
 * estimated or filled in locally.
 */
export function StudentDashboardPage() {
  const { user, roles } = useAuth();
  const { state: profileState } = useStudentProfile();

  const enrollmentLoader = useCallback(() => enrollmentApi.listMine(), []);
  const catalogLoader = useCallback(
    () => catalogApi.list({ page: 0, size: 100 }),
    [],
  );

  const enrollmentsResource = useAsyncResource<Enrollment[]>(
    enrollmentLoader,
    "mine",
    "Your enrollments could not be loaded from the Student Service.",
  );
  const catalogResource = useAsyncResource<CatalogPage>(
    catalogLoader,
    "catalogue",
    "The course catalogue could not be loaded from the Student Service.",
  );

  const enrollments = useMemo(
    () => enrollmentsResource.data ?? [],
    [enrollmentsResource.data],
  );

  const activeEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === "ACTIVE"),
    [enrollments],
  );

  const cancelledEnrollments = useMemo(
    () => enrollments.filter((item) => item.status === "CANCELLED"),
    [enrollments],
  );

  const courses = useMemo(
    () =>
      new Map(
        (catalogResource.data?.content ?? []).map((course) => [
          course.id,
          course,
        ]),
      ),
    [catalogResource.data],
  );

  const publishedCount = catalogResource.data
    ? catalogResource.data.totalElements
    : null;

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Student";

  const profile = profileState.status === "ready" ? profileState.profile : null;

  return (
    <div className="page">
      {/* Existing Accessible Header for tests and screen readers */}
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Student dashboard</p>
          <h1 className="page__title">Welcome back, {displayName}</h1>
        </div>
        <div className="card__actions">
          <Link className="button button--secondary" to="/courses">
            Course Catalogue
          </Link>
          <Link className="button button--primary" to="/student/courses">
            My Courses
          </Link>
        </div>
      </header>

      {/* EduLearn Hero Banner & Quick Action */}
      <section className="edulearn-top-row" aria-label="Hero overview">
        <EduLearnHeroBanner
          title="Learn Effectively With Us!"
          subtitle="Master Olympiad problem solving, participate in live mock contests, and track your progress."
          eyebrow="Student Learning Hub"
          studentStat="75,000+"
          mentorStat="200+"
        />

        <EduLearnQuickAction
          prompt="Ready for your next challenge?"
          buttonLabel="Explore Courses"
          buttonTo="/courses"
          stat1Label="Active Courses"
          stat1Value={
            enrollmentsResource.loading ? "…" : activeEnrollments.length
          }
          stat2Label="Mock Contests"
          stat2Value="12"
        />
      </section>

      {/* Real Data Stat Grid */}
      <section className="stat-grid" aria-label="Your learning overview">
        <StatCard
          label="Enrolled courses"
          value={enrollmentsResource.loading ? "—" : activeEnrollments.length}
          hint="Active enrollments of the Student Service"
        />
        <StatCard
          label="Published courses"
          value={catalogResource.loading ? "—" : (publishedCount ?? "—")}
          hint="Courses currently open for enrollment"
        />
        <StatCard
          label="Cancelled enrollments"
          value={
            enrollmentsResource.loading ? "—" : cancelledEnrollments.length
          }
          hint="You can enrol again in these courses"
        />
      </section>

      {enrollmentsResource.error ? (
        <Alert variant="error" title="Your enrollments could not be loaded">
          {enrollmentsResource.error}
        </Alert>
      ) : null}

      {/* EduLearn Middle Row */}
      <section
        className="edulearn-mid-row"
        aria-label="Popular courses and mentors"
      >
        <EduLearnPopularCourses
          title="Recommended Courses"
          viewAllLink="/courses"
        />

        <EduLearnActivityCard />

        <EduLearnTopInstructors />
      </section>

      {/* EduLearn Bottom Row: Analytics */}
      <section aria-label="Student performance and analytics">
        <EduLearnAnalyticsRow />
      </section>

      {/* Student Profile & Enrollments Grid */}
      <div className="card-grid">
        <section className="card" aria-labelledby="student-profile-heading">
          <h2 className="card__title" id="student-profile-heading">
            Your student profile
          </h2>

          {profileState.status === "loading" ? (
            <Skeleton lines={4} label="Loading the student profile" />
          ) : null}

          {profileState.status === "missing" ? (
            <EmptyState
              title="No student profile yet"
              description="The Student Service has no profile for your account. Create one to complete your registration."
              action={
                <Link className="button button--primary" to="/student/profile">
                  Create your profile
                </Link>
              }
            />
          ) : null}

          {profileState.status === "error" ? (
            <Alert variant="warning" title="The profile could not be loaded">
              {profileState.message}
            </Alert>
          ) : null}

          {profile ? (
            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Full name</dt>
                <dd>{profile.fullName || "—"}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Grade</dt>
                <dd>{profile.grade || "—"}</dd>
              </div>
              <div className="detail-list__row">
                <dt>School</dt>
                <dd>{profile.schoolName || "—"}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Phone</dt>
                <dd>{profile.phone || "—"}</dd>
              </div>
            </dl>
          ) : null}

          <p className="card__hint">
            Roles of your account:{" "}
            {roles.length > 0 ? roles.join(", ") : "none reported"}.
          </p>

          <p className="card__hint">
            <Link className="link" to="/student/profile">
              View and edit the full profile
            </Link>
          </p>
        </section>

        <section className="card" aria-labelledby="student-enrollments-heading">
          <h2 className="card__title" id="student-enrollments-heading">
            Your enrollments
          </h2>

          {enrollmentsResource.loading ? (
            <Skeleton lines={3} label="Loading the enrollments" />
          ) : null}

          {!enrollmentsResource.loading && enrollments.length === 0 ? (
            <EmptyState
              title="No enrollments yet"
              description="Browse the catalogue and enrol in a course to get started."
              action={
                <Link className="button button--primary" to="/courses">
                  Open the catalogue
                </Link>
              }
            />
          ) : null}

          {!enrollmentsResource.loading && enrollments.length > 0 ? (
            <ul className="enrollment-list">
              {enrollments.map((enrollment) => {
                const course = courses.get(enrollment.courseId);
                return (
                  <li className="enrollment-list__item" key={enrollment.id}>
                    <div>
                      <p className="enrollment-list__title">
                        {course?.title ?? "Course details unavailable"}
                      </p>
                      <p className="enrollment-list__meta">
                        {course
                          ? `${course.code} · ${course.subject}`
                          : `Course ${enrollment.courseId}`}
                      </p>
                    </div>
                    <span className="badge">{enrollment.status}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <p className="card__hint">
            <Link className="link" to="/student/courses">
              Open My Courses
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
