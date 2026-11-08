import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { contentApi } from '../api/contentApi'
import type {
  ContentResource,
  CreateContentResourceRequest,
  CreateLessonRequest,
  Lesson,
  LessonStatus,
  ResourceType,
  UpdateLessonRequest,
} from '../types/content'

type LessonFormState = {
  courseId: string
  subject: string
  grade: string
  title: string
  description: string
  chapterNumber: string
  status: LessonStatus
}

const emptyForm: LessonFormState = {
  courseId: '',
  subject: '',
  grade: '',
  title: '',
  description: '',
  chapterNumber: '1',
  status: 'DRAFT',
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export default function ContentManagementPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<LessonFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [resources, setResources] = useState<ContentResource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourceError, setResourceError] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceType, setResourceType] = useState<ResourceType>('LINK')
  const [resourceDisplayOrder, setResourceDisplayOrder] = useState('1')

  const loadLessons = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await contentApi.list()
      setLessons(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLessons()
  }, [loadLessons])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id)
    setForm({
      courseId: lesson.courseId,
      subject: lesson.subject,
      grade: lesson.grade,
      title: lesson.title,
      description: lesson.description ?? '',
      chapterNumber: String(lesson.chapterNumber),
      status: lesson.status,
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const chapterNumber = Number(form.chapterNumber)

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.courseId.trim() ||
      !form.grade.trim() ||
      !Number.isInteger(chapterNumber) ||
      chapterNumber <= 0
    ) {
      setError('Enter valid title, subject, course ID, grade, and chapter number.')
      return
    }

    setSaving(true)

    try {
      if (editingId !== null) {
        const payload: UpdateLessonRequest = {
          subject: form.subject.trim(),
          grade: form.grade.trim(),
          title: form.title.trim(),
          description: form.description.trim() || null,
          chapterNumber,
          status: form.status,
        }
        await contentApi.update(editingId, payload)
        setSuccess('Lesson updated successfully.')
      } else {
        const payload: CreateLessonRequest = {
          courseId: form.courseId.trim(),
          subject: form.subject.trim(),
          grade: form.grade.trim(),
          title: form.title.trim(),
          description: form.description.trim() || null,
          chapterNumber,
        }
        await contentApi.create(payload)
        setSuccess('Lesson created successfully.')
      }

      cancelForm()
      await loadLessons()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!window.confirm('Delete lesson ' + lesson.title + '? This action cannot be undone.')) return

    setError('')
    setSuccess('')

    try {
      await contentApi.remove(lesson.id)

      if (selectedLesson?.id === lesson.id) {
        setSelectedLesson(null)
        setResources([])
      }

      setSuccess('Lesson deleted successfully.')
      await loadLessons()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  async function openResources(lesson: Lesson) {
    setSelectedLesson(lesson)
    setResources([])
    setResourceError('')
    setResourceTitle('')
    setResourceUrl('')
    setResourceType('LINK')
    setResourceDisplayOrder('1')
    setResourcesLoading(true)

    try {
      const response = await contentApi.listResources(lesson.id)
      setResources(Array.isArray(response) ? response : [])
    } catch (err) {
      setResourceError(errorMessage(err))
    } finally {
      setResourcesLoading(false)
    }
  }

  async function handleCreateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedLesson || !resourceTitle.trim() || !resourceUrl.trim()) {
      setResourceError('Enter resource title and URL.')
      return
    }

    const displayOrder = Number(resourceDisplayOrder)
    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
      setResourceError('Enter a valid display order.')
      return
    }

    setResourceError('')

    const payload: CreateContentResourceRequest = {
      type: resourceType,
      title: resourceTitle.trim(),
      url: resourceUrl.trim(),
      displayOrder,
    }

    try {
      await contentApi.createResource(selectedLesson.id, payload)

      setResourceTitle('')
      setResourceUrl('')
      setResourceType('LINK')
      setResourceDisplayOrder('1')

      const response = await contentApi.listResources(selectedLesson.id)
      setResources(Array.isArray(response) ? response : [])
    } catch (err) {
      setResourceError(errorMessage(err))
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    font: 'inherit',
  }

  const buttonStyle = {
    padding: '9px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    background: '#ffffff',
    color: '#1e293b',
    cursor: 'pointer',
    font: 'inherit',
  }

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '28px 20px',
        color: '#0f172a',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div>
          <p
            style={{
              color: '#2563eb',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            OLYMPIAD LEARNING ACADEMY
          </p>
          <h1 style={{ margin: '6px 0' }}>Content Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Manage lessons and learning resources.
          </p>
        </div>

        <button
          type="button"
          style={{
            ...buttonStyle,
            background: '#315bf5',
            color: '#ffffff',
            borderColor: '#315bf5',
          }}
          onClick={startCreate}
        >
          + Create Lesson
        </button>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '6px',
            background: '#fee2e2',
            color: '#991b1b',
          }}
        >
          {error}
          <button
            type="button"
            style={{ ...buttonStyle, marginLeft: '12px' }}
            onClick={() => void loadLessons()}
          >
            Retry
          </button>
        </div>
      )}

      {success && (
        <p
          role="status"
          style={{
            padding: '12px',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: '6px',
          }}
        >
          {success}
        </p>
      )}

      {showForm && (
        <section
          style={{
            border: '1px solid #dbe3ef',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            background: '#ffffff',
          }}
        >
          <h2>{editingId !== null ? 'Edit Lesson' : 'Create Lesson'}</h2>

          <form onSubmit={handleSave}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <label>
                Title *
                <input
                  required
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </label>

              <label>
                Course ID (UUID) *
                <input
                  required
                  style={inputStyle}
                  value={form.courseId}
                  onChange={(e) =>
                    setForm({ ...form, courseId: e.target.value })
                  }
                />
              </label>

              <label>
                Subject *
                <input
                  required
                  style={inputStyle}
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
              </label>

              <label>
                Grade *
                <input
                  required
                  style={inputStyle}
                  value={form.grade}
                  onChange={(e) =>
                    setForm({ ...form, grade: e.target.value })
                  }
                />
              </label>

              <label>
                Chapter number *
                <input
                  required
                  type="number"
                  min="1"
                  style={inputStyle}
                  value={form.chapterNumber}
                  onChange={(e) =>
                    setForm({ ...form, chapterNumber: e.target.value })
                  }
                />
              </label>

              {editingId !== null && (
                <label>
                  Status
                  <select
                    style={inputStyle}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as LessonStatus })
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </label>
              )}

              <label style={{ gridColumn: '1 / -1' }}>
                Description
                <textarea
                  rows={3}
                  style={inputStyle}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '18px',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  background: '#315bf5',
                  color: '#ffffff',
                }}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save Changes'
                    : 'Create Lesson'}
              </button>

              <button
                type="button"
                style={buttonStyle}
                onClick={cancelForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section
        style={{
          border: '1px solid #dbe3ef',
          borderRadius: '12px',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>Lessons</h2>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => void loadLessons()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ padding: '24px' }}>Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <p style={{ padding: '24px', color: '#64748b' }}>
            No lessons found. Create your first lesson to get started.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    'Title',
                    'Subject',
                    'Grade',
                    'Course',
                    'Chapter',
                    'Status',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td style={{ padding: '12px' }}>{lesson.title}</td>
                    <td style={{ padding: '12px' }}>{lesson.subject}</td>
                    <td style={{ padding: '12px' }}>{lesson.grade}</td>
                    <td style={{ padding: '12px' }}>{lesson.courseId}</td>
                    <td style={{ padding: '12px' }}>
                      {lesson.chapterNumber}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {lesson.status}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => startEdit(lesson)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => void openResources(lesson)}
                        >
                          Resources
                        </button>

                        <button
                          type="button"
                          style={{
                            ...buttonStyle,
                            color: '#b91c1c',
                          }}
                          onClick={() => void handleDelete(lesson)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedLesson && (
        <section
          style={{
            marginTop: '24px',
            padding: '20px',
            border: '1px solid #dbe3ef',
            borderRadius: '12px',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <h2>Resources: {selectedLesson.title}</h2>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                setSelectedLesson(null)
                setResources([])
                setResourceError('')
              }}
            >
              Close
            </button>
          </div>

          {resourceError && (
            <p role="alert" style={{ color: '#b91c1c' }}>
              {resourceError}
            </p>
          )}

          {resourcesLoading ? (
            <p>Loading resources...</p>
          ) : resources.length === 0 ? (
            <p style={{ color: '#64748b' }}>No resources found.</p>
          ) : (
            <ul>
              {resources.map((resource) => (
                <li key={resource.id} style={{ marginBottom: '10px' }}>
                  <strong>{resource.title}</strong>
                  {resource.type && (
                    <> ï¿½ {resource.type}</>
                  )}
                  <div>Order: {resource.displayOrder}</div>
                  {resource.url ? (
                    resource.url.toLowerCase().startsWith('s3://') ? (
                      <p style={{ color: '#b91c1c' }}>
                        This resource link is not browser-accessible. Please contact an administrator.
                      </p>
                    ) : (
                      <div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                        >
                          Open / download resource
                        </a>
                      </div>
                    )
                  ) : (
                    <p style={{ color: '#64748b' }}>No valid URL available for this resource.</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h3>Add Resource</h3>

          <form
            onSubmit={handleCreateResource}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <label>
              Resource title *
              <input
                required
                style={inputStyle}
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
              />
            </label>

            <label>
              Resource type *
              <select
                style={inputStyle}
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
              >
                <option value="LINK">LINK</option>
                <option value="VIDEO">VIDEO</option>
                <option value="PDF">PDF</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="IMAGE">IMAGE</option>
                <option value="AUDIO">AUDIO</option>
              </select>
            </label>

            <label>
              Resource URL *
              <input
                type="url"
                required
                style={inputStyle}
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label>
              Display order *
              <input
                type="number"
                min="1"
                required
                style={inputStyle}
                value={resourceDisplayOrder}
                onChange={(e) => setResourceDisplayOrder(e.target.value)}
              />
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'end',
              }}
            >
              <button type="submit" style={buttonStyle}>
                Add Resource
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  )
}
