
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { ApiError, networkError, timeoutError, toApiError } from './errors'
import { getAccessToken } from '../auth/tokenStorage'
import { apiConfiguration, type ServiceEndpoint } from '../config/apiConfig'

const DEFAULT_TIMEOUT_MS = 15000

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler
}

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register']

function apiOrigin(baseUrl: string): string | null {
  try {
    return new URL(baseUrl).origin
  } catch {
    return null
  }
}

function resolveOrigin(
  config: InternalAxiosRequestConfig,
  baseUrl: string,
): string | null {
  const base = config.baseURL ?? baseUrl

  try {
    return new URL(config.url ?? '', base).origin
  } catch {
    return null
  }
}

function isAuthenticatedRequest(
  config: InternalAxiosRequestConfig,
): boolean {
  const headers = config.headers

  if (!headers) return false

  const value =
    typeof headers.get === 'function'
      ? headers.get('Authorization')
      : (headers as unknown as Record<string, unknown>)['Authorization']

  return typeof value === 'string' && value.length > 0
}

function requestPath(
  config: InternalAxiosRequestConfig,
  baseUrl: string,
): string | null {
  const base = config.baseURL ?? baseUrl

  try {
    return new URL(config.url ?? '', base).pathname
  } catch {
    return null
  }
}

export interface ApiClientOptions {
  serviceName: string
  publicPaths?: readonly string[]
}

export function createApiClient(
  endpoint: ServiceEndpoint,
  options: ApiClientOptions,
): AxiosInstance {
  const publicPaths = options.publicPaths ?? []
  const baseUrl = endpoint.baseUrl

  const client: AxiosInstance = axios.create({
    baseURL: `${baseUrl}${endpoint.pathPrefix}`,
    timeout: DEFAULT_TIMEOUT_MS,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (endpoint.configurationError) {
      return Promise.reject(
        new ApiError({
          status: 0,
          code: 'CONFIGURATION_ERROR',
          isNetworkError: true,
          message: endpoint.configurationError,
        }),
      )
    }

    const token = getAccessToken()
    if (!token) return config

    // Never send the token to an origin other than this client's configured host.
    const origin = resolveOrigin(config, baseUrl)
    const target = apiOrigin(baseUrl)

    if (origin && target && origin !== target) {
      return config
    }

    const path = requestPath(config, baseUrl)

    if (path && publicPaths.includes(path)) {
      return config
    }

    config.headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error)
      }

      const axiosError = error as AxiosError
      const config = axiosError.config

      if (!axiosError.response) {
        const isTimeout =
          axiosError.code === AxiosError.ECONNABORTED ||
          axiosError.code === AxiosError.ETIMEDOUT

        return Promise.reject(
          isTimeout
            ? timeoutError(options.serviceName)
            : networkError(options.serviceName, baseUrl),
        )
      }

      const { status, data } = axiosError.response
      const apiError = toApiError(status, data)

      if (
        status === 401 &&
        config &&
        isAuthenticatedRequest(config as InternalAxiosRequestConfig)
      ) {
        unauthorizedHandler?.()
      }

      return Promise.reject(apiError)
    },
  )

  return client
}

/** Identity Service configuration. */
export const API_BASE_URL: string = apiConfiguration.identity.baseUrl

/** Identity Service client. */
export const apiClient: AxiosInstance = createApiClient(
  apiConfiguration.identity,
  {
    serviceName: 'Identity Service',
    publicPaths: PUBLIC_PATHS,
  },
)

/** Course Service client. */
export const courseClient: AxiosInstance = createApiClient(
  apiConfiguration.course,
  {
    serviceName: 'Course Service',
  },
)

/** Student Service client. */
export const studentClient: AxiosInstance = createApiClient(
  apiConfiguration.student,
  {
    serviceName: 'Student Service',
  },
)

/**
 * Content Service client.
 *
 * Configure apiConfiguration.content with:
 * baseUrl: http://localhost:8088
 * pathPrefix: ''
 *
 * Content API methods should use full paths such as /api/content/lessons.
 */
export const contentClient: AxiosInstance = createApiClient(
  apiConfiguration.content,
  {
    serviceName: 'Content Service',
  },
)

/** Live Class Service client. */
export const liveClassClient: AxiosInstance = createApiClient(
  apiConfiguration.liveClass,
  {
    serviceName: 'Live Class Service',
  },
)

export type ApiRequestOptions = AxiosRequestConfig

export function toApiErrorSafe(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  return new ApiError({
    status: 0,
    message:
      'An unexpected error occurred while talking to the backend service.',
  })
}
