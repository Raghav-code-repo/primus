/**
 * Normalisation of the different error bodies returned by the backend services.
 *
 * Observed backend shapes:
 *
 * Identity Service (`ApiExceptionHandler`, `JwtAuthenticationFilter`,
 * Spring Security entry point / access denied handler):
 *
 *  - { timestamp, status, message }                                  (ResponseStatusException)
 *  - { error: 'NOT_FOUND'|'CONFLICT'|'UNAUTHORIZED'|'FORBIDDEN', message }
 *  - { error: 'VALIDATION_FAILED', fields: { <field>: <message> } }
 *  - { error: 'UNAUTHORIZED', message }                               (JWT filter)
 *  - empty body                                                       (Spring Security)
 *
 * Course Service (`GlobalExceptionHandler`, RFC 7807 problem details):
 *
 *  - { type, title, status, detail }                                 (ProblemDetail)
 *  - { ... , detail: "code: must not be blank; title: must not be blank" }
 */

export interface ApiErrorInit {
  status: number
  message: string
  code?: string
  fieldErrors?: Record<string, string>
  isNetworkError?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly fieldErrors: Record<string, string>
  readonly isNetworkError: boolean

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.fieldErrors = init.fieldErrors ?? {}
    this.isNetworkError = init.isNetworkError ?? false
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isConflict(): boolean {
    return this.status === 409
  }

  /**
   * True for HTTP 422. The Student Service answers with 422 when a course
   * exists but is not open for enrollment (for example a DRAFT course).
   */
  get isUnprocessable(): boolean {
    return this.status === 422
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isServiceUnavailable(): boolean {
    return this.status === 503
  }

  get isValidationError(): boolean {
    return this.status === 400 && Object.keys(this.fieldErrors).length > 0
  }
}

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'The request was rejected because it contains invalid data.',
  401: 'Your session is not valid. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'The request conflicts with the current state of the resource.',
  422: 'This course is not currently open for enrollment.',
  500: 'The backend service returned an unexpected error.',
  502: 'The backend service is unreachable or returned an invalid response.',
  503: 'The backend service is currently unavailable.',
  504: 'The backend service took too long to respond.',
}

export function fallbackMessageForStatus(status: number): string {
  return (
    STATUS_FALLBACK_MESSAGES[status] ??
    `The request failed with status ${status}. Please try again.`
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined
}

function readFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }
  const result: Record<string, string> = {}
  for (const [field, message] of Object.entries(value)) {
    const text = readString(message)
    if (text) {
      result[field] = text
    }
  }
  return result
}

/**
 * Parses the validation detail of the Course Service, which lists the
 * rejected fields as `field: message` pairs separated by `;`.
 */
function parseFieldErrorsFromDetail(detail: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of detail.split(';')) {
    const separator = part.indexOf(':')
    if (separator <= 0) {
      continue
    }
    const field = part.slice(0, separator).trim()
    const message = part.slice(separator + 1).trim()
    if (field.length > 0 && message.length > 0) {
      result[field] = message
    }
  }
  return result
}

/**
 * Builds an {@link ApiError} from a raw response body and HTTP status.
 * Unknown/HTML bodies are reduced to a readable, non-leaking message.
 */
export function toApiError(status: number, body: unknown): ApiError {
  if (isRecord(body)) {
    const fieldErrors = readFieldErrors(body.fields)

    // RFC 7807 problem detail (Course Service).
    const detail = readString(body.detail)
    const title = readString(body.title)
    if (detail || title) {
      const detailFieldErrors = detail
        ? parseFieldErrorsFromDetail(detail)
        : {}
      return new ApiError({
        status,
        message: detail ?? title ?? fallbackMessageForStatus(status),
        code: readString(body.type)?.split('/').pop(),
        fieldErrors: { ...detailFieldErrors, ...fieldErrors },
      })
    }

    const code = readString(body.error)
    const message =
      readString(body.message) ??
      (Object.keys(fieldErrors).length > 0
        ? 'Some fields are invalid. Please review the form and try again.'
        : undefined) ??
      fallbackMessageForStatus(status)

    return new ApiError({
      status,
      message,
      code,
      fieldErrors,
    })
  }

  if (typeof body === 'string' && body.trim().length > 0) {
    return new ApiError({ status, message: fallbackMessageForStatus(status) })
  }

  return new ApiError({ status, message: fallbackMessageForStatus(status) })
}

export function networkError(serviceName: string, baseUrl: string): ApiError {
  return new ApiError({
    status: 0,
    code: 'NETWORK_ERROR',
    isNetworkError: true,
    message: `Unable to reach the ${serviceName} at ${baseUrl}. Check that the backend is running and that the API base URL is correct.`,
  })
}

export function timeoutError(serviceName: string): ApiError {
  return new ApiError({
    status: 0,
    code: 'TIMEOUT',
    isNetworkError: true,
    message: `The ${serviceName} did not respond in time. Please try again in a moment.`,
  })
}
