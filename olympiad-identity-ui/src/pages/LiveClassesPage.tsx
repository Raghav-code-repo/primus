import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listLiveClasses,
  cancelLiveClass,
  getLiveKitToken,
  type LiveClass,
} from '../api/liveClassApi'
import { courseApi } from '../api/courseApi'
import { useAuth } from '../auth/useAuth'
import { hasRole, ROLE_STUDENT } from '../auth/roles'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../hooks/useToast'
import type { Course } from '../types/course'

export function LiveClassesPage() {
  const { isAuthenticated, roles, hasPermission } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const canJoin = hasPermission('LIVE_CLASS_JOIN')
  const canUpdate = hasPermission('LIVE_CLASS_UPDATE')
  const canCancel = hasPermission('LIVE_CLASS_CANCEL')
  const canCreate = hasPermission('LIVE_CLASS_CREATE')
  const isStudent = hasRole(roles, ROLE_STUDENT)

  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const courseById = useMemo<Record<string, Course>>(() => {
    const map: Record<string, Course> = {}
    for (const course of courses) {
      map[course.id] = course
    }
    return map
  }, [courses])

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listLiveClasses()
      setClasses(data)
    } catch (err: unknown) {
      const status = getAxiosErrorStatus(err)
      if (status === 401) setError('Session expired. Please log in again.')
      else if (status === 403) setError('Insufficient permissions to view live classes.')
      else if (status === 404) setError('Live classes endpoint not found. Check API configuration.')
      else if (status !== undefined && status >= 500) setError('Server error while loading live classes.')
      else if (status === 0) setError('Unable to connect to the server.')
      else setError('Failed to load live classes')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true)
      const result = await courseApi.list({ size: 100 })
      setCourses(result.content)
    } catch {
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadClasses()
      loadCourses()
    }
  }, [isAuthenticated, loadClasses, loadCourses])

  const handleJoin = async (id: string) => {
    if (!canJoin) {
      return
    }
    try {
      setJoiningId(id)
      const { token, url } = await getLiveKitToken(id)
      navigate(
        `/live-classes/${id}/room?token=${encodeURIComponent(token)}&url=${encodeURIComponent(url)}`,
      )
    } catch {
      setError('Failed to join live class')
      setJoiningId(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!canCancel) {
      return
    }
    if (!window.confirm('Cancel this live class?')) {
      return
    }
    try {
      setCancellingId(id)
      await cancelLiveClass(id)
      toast({
        variant: 'success',
        title: 'Live class cancelled',
        description: 'The session has been cancelled.',
        duration: 4000,
      })
      await loadClasses()
    } catch {
      setError('Failed to cancel live class')
    } finally {
      setCancellingId(null)
    }
  }

  const handleEdit = (id: string) => {
    if (!canUpdate) {
      return
    }
    navigate(`/live-classes/${id}/edit`)
  }

  const statusBadgeClass = (status: string) => {
    const variant =
      {
        SCHEDULED: 'status-badge--scheduled',
        LIVE: 'status-badge--live',
        COMPLETED: 'status-badge--completed',
        CANCELLED: 'status-badge--cancelled',
      }[status] || 'status-badge--scheduled'
    return `status-badge ${variant}`
  }

  if (!isAuthenticated) {
    return <div className="page-container"><p>Please log in.</p></div>
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Live Classes</h1>
          <p>Schedule and manage interactive online learning sessions.</p>
        </div>
        <div className="card__actions">
          {canCreate ? (
            <a
              href="/live-classes/create"
              className="button button--primary"
              onClick={(event) => {
                event.preventDefault()
                navigate('/live-classes/create')
              }}
            >
              Create Live Class
            </a>
          ) : null}
          <button onClick={loadClasses} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>
      {error ? (
        <EmptyState
          title="Unable to load live classes"
          description={error}
          action={
            <button
              onClick={loadClasses}
              disabled={loading}
              className="button button--primary"
            >
              Refresh
            </button>
          }
        />
      ) : (loading || coursesLoading) ? (
        <p>Loading…</p>
      ) : classes.length === 0 ? (
        <EmptyState
          title={
            isStudent
              ? "No Live Classes are currently assigned to you."
              : "No live classes yet"
          }
          description={
            <div>
              {isStudent
                ? "A teacher must assign you to a live class before it appears here."
                : "There are no scheduled live classes."}
              {' '}
              {canCreate ? (
                <span>Create one to get started.</span>
              ) : null}
            </div>
          }
          action={
            canCreate ? (
              <a
                href="/live-classes/create"
                className="button button--primary"
                onClick={(event) => {
                  event.preventDefault()
                  navigate('/live-classes/create')
                }}
              >
                Create Live Class
              </a>
            ) : null
          }
        />
      ) : (
        <div className="card-grid">
          {classes.map((cls) => {
            const course = courseById[cls.courseId]
            const isActive = cls.status === 'SCHEDULED' || cls.status === 'LIVE'
            return (
              <article key={cls.id} className="card">
                <header className="card__header">
                  <h2 className="card__title">{cls.title}</h2>
                  <span className={statusBadgeClass(cls.status)}>
                    {cls.status}
                  </span>
                </header>
                <p className="card__text">
                  <strong>Course:</strong>{' '}
                  {course
                    ? `${course.title} (${course.subject} · ${
                        course.gradeLevel
                      })`
                    : cls.courseId}
                </p>
                <p className="card__text">
                  <strong>Teacher:</strong> {cls.teacherId}
                </p>
                {cls.accessSource ? (
                  <p className="card__text">
                    <strong>Access:</strong>{' '}
                    {cls.accessSource === 'ASSIGNED'
                      ? 'Assigned to you'
                      : 'Enrolled course'}
                  </p>
                ) : null}
                <p className="card__text">
                  <strong>Start:</strong> {formatDateTime(cls.scheduledStart)}
                </p>
                <p className="card__text">
                  <strong>End:</strong> {formatDateTime(cls.scheduledEnd)}
                </p>
                <div className="card__actions">
                  {canJoin && isActive ? (
                    <button
                      onClick={() => handleJoin(cls.id)}
                      disabled={joiningId === cls.id}
                    >
                      {joiningId === cls.id ? 'Joining…' : 'Join Class'}
                    </button>
                  ) : null}
                  {canUpdate ? (
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleEdit(cls.id)}
                    >
                      Edit
                    </button>
                  ) : null}
                  {canCancel && cls.status === 'SCHEDULED' ? (
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => handleCancel(cls.id)}
                      disabled={cancellingId === cls.id}
                    >
                      {cancellingId === cls.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatDateTime(utcIso: string): string {
  return new Date(utcIso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getAxiosErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === 'object') {
    if ('status' in err) {
      return (err as { status?: number }).status
    }
    const response = (err as { response?: { status?: number } }).response
    if (response && 'status' in response) {
      return response.status
    }
  }
  return undefined
}
