import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { EduLearnHeroBanner } from '../components/dashboard/EduLearnHeroBanner'
import { EduLearnQuickAction } from '../components/dashboard/EduLearnQuickAction'
import { EduLearnPopularCourses } from '../components/dashboard/EduLearnPopularCourses'
import { EduLearnActivityCard } from '../components/dashboard/EduLearnActivityCard'
import { EduLearnTopInstructors } from '../components/dashboard/EduLearnTopInstructors'
import { EduLearnAnalyticsRow } from '../components/dashboard/EduLearnAnalyticsRow'
import { useAuth } from '../auth/useAuth'
import { catalogApi } from '../api/catalogApi'
import { listLiveClasses } from '../api/liveClassApi'
import {
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_DELETE,
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_UPDATE,
  PERMISSION_LIVE_CLASS_READ,
  splitAuthorities,
} from '../auth/permissions'
import { useAsyncResource } from '../hooks/useAsyncResource'
import type { CatalogPage } from '../types/course'
import type { LiveClass } from '../api/liveClassApi'

/**
 * The dashboard of the teaching staff.
 *
 * Layout matches the administrator and student dashboards. Numbers are read
 * from the backend where an endpoint exists. Teaching-specific features that
 * the backend does not expose (classes, rosters, assignments, grading) are
 * reported as not available instead of being invented.
 */
export function FacultyDashboardPage() {
  const { user, roles, authorities, authoritiesError, hasPermission } = useAuth()

  const { roles: authorityRoles, permissions } = splitAuthorities(authorities)

  const catalogLoader = useCallback(
    () => catalogApi.list({ page: 0, size: 1 }),
    [],
  )
  const liveClassesLoader = useCallback(() => {
    if (!hasPermission(PERMISSION_LIVE_CLASS_READ)) {
      return Promise.resolve<LiveClass[]>([])
    }
    return listLiveClasses()
  }, [hasPermission])

  const catalogResource = useAsyncResource<CatalogPage>(
    catalogLoader,
    'catalogue',
    'The number of courses could not be loaded from the Student Service.',
  )
  const liveClassesResource = useAsyncResource<LiveClass[]>(
    liveClassesLoader,
    hasPermission(PERMISSION_LIVE_CLASS_READ) ? 'live-classes' : 'live-classes-skip',
    'Live classes could not be loaded from the Live Class Service.',
  )

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Teacher'

  const canManageCourses =
    hasPermission(PERMISSION_COURSE_CREATE) ||
    hasPermission(PERMISSION_COURSE_UPDATE) ||
    hasPermission(PERMISSION_COURSE_DELETE) ||
    hasPermission(PERMISSION_COURSE_READ)

  const liveClassCount = hasPermission(PERMISSION_LIVE_CLASS_READ)
    ? (liveClassesResource.data?.length ?? null)
    : null

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Faculty dashboard</p>
          <h1 className="page__title">Welcome back, {displayName}</h1>
        </div>
        <div className="card__actions">
          <Link className="button button--secondary" to="/courses">
            Course Catalogue
          </Link>
          {canManageCourses ? (
            <Link className="button button--primary" to="/admin/courses">
              Course Management
            </Link>
          ) : null}
        </div>
      </header>

      <section className="edulearn-top-row" aria-label="Hero overview">
        <EduLearnHeroBanner
          title="Guide Scholars With Your Expertise!"
          subtitle="Lead live sessions, shape Olympiad preparation, and support learners across the academy."
          eyebrow="Faculty Command Center"
          studentStat="75,000+"
          mentorStat="200+"
        />

        <EduLearnQuickAction
          prompt="Ready to teach your next class?"
          buttonLabel={canManageCourses ? 'Open Course Management' : 'Browse Courses'}
          buttonTo={canManageCourses ? '/admin/courses' : '/courses'}
          stat1Label="Published Courses"
          stat1Value={
            catalogResource.loading
              ? '…'
              : (catalogResource.data?.totalElements ?? '—')
          }
          stat2Label="Live Classes"
          stat2Value={
            !hasPermission(PERMISSION_LIVE_CLASS_READ)
              ? '—'
              : liveClassesResource.loading
                ? '…'
                : (liveClassCount ?? '—')
          }
        />
      </section>

      <section className="stat-grid" aria-label="Teaching overview">
        <StatCard
          label="Published courses"
          value={
            catalogResource.loading
              ? '—'
              : (catalogResource.data?.totalElements ?? '—')
          }
          hint="Courses currently open for enrollment"
        />
        <StatCard
          label="Live classes"
          value={
            !hasPermission(PERMISSION_LIVE_CLASS_READ)
              ? '—'
              : liveClassesResource.loading
                ? '—'
                : (liveClassCount ?? '—')
          }
          hint={
            hasPermission(PERMISSION_LIVE_CLASS_READ)
              ? 'Reported by the Live Class Service'
              : 'Not available without LIVE_CLASS_READ'
          }
        />
        <StatCard
          label="Your roles"
          value={roles.length > 0 ? roles.join(', ') : '—'}
          hint="Reported by GET /api/auth/me"
        />
      </section>

      {catalogResource.error ? (
        <Alert variant="warning" title="Not available">
          {catalogResource.error}
        </Alert>
      ) : null}

      {hasPermission(PERMISSION_LIVE_CLASS_READ) && liveClassesResource.error ? (
        <Alert variant="warning" title="Not available">
          {liveClassesResource.error}
        </Alert>
      ) : null}

      {authoritiesError ? (
        <Alert variant="warning" title="Authorities unavailable">
          {authoritiesError}
        </Alert>
      ) : null}

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

      <section aria-label="Teaching analytics">
        <EduLearnAnalyticsRow />
      </section>

      <div className="card-grid">
        <section className="card" aria-labelledby="faculty-account-heading">
          <h2 className="card__title" id="faculty-account-heading">
            Your account
          </h2>
          <dl className="detail-list">
            <div className="detail-list__row">
              <dt>Name</dt>
              <dd>{user ? `${user.firstName} ${user.lastName}` : '—'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Email</dt>
              <dd>{user?.email ?? '—'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Roles</dt>
              <dd>{roles.length > 0 ? roles.join(', ') : '—'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Permissions</dt>
              <dd>
                {permissions.length > 0 ? permissions.join(', ') : 'none mapped'}
              </dd>
            </div>
          </dl>
          {authorityRoles.length > 0 ? (
            <p className="card__hint">
              Roles reported as authorities:{' '}
              {authorityRoles.map((role) => (
                <span className="badge" key={role}>
                  ROLE_{role}
                </span>
              ))}
            </p>
          ) : null}
          <p className="card__hint">
            <Link className="link" to="/profile">
              Open your account page
            </Link>
          </p>
        </section>

        <section className="card" aria-labelledby="faculty-features-heading">
          <h2 className="card__title" id="faculty-features-heading">
            Teaching features
          </h2>
          <EmptyState
            title="Not available yet"
            description={
              <>
                <p>
                  The backend does not offer any teaching specific endpoint yet.
                  There is no class, roster, assignment or grading API in the
                  Course Service or the Student Service, so this dashboard cannot
                  show real teaching data.
                </p>
                <p>
                  What the backend does support is the course catalogue and -
                  depending on the permissions that are mapped to your role - the
                  course management of the Course Service.
                </p>
              </>
            }
            action={
              <Link className="button button--primary" to="/courses">
                Open the course catalogue
              </Link>
            }
          />
        </section>
      </div>
    </div>
  )
}
