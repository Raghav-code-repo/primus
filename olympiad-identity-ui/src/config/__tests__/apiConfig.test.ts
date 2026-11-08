import { describe, expect, it } from 'vitest'

import { resolveApiConfiguration } from '../apiConfig'

describe('the api configuration', () => {
  it('uses the direct service urls by default', () => {
    const config = resolveApiConfiguration({
      VITE_IDENTITY_API_URL: 'http://localhost:8080',
      VITE_COURSE_API_URL: 'http://localhost:8081',
      VITE_STUDENT_API_URL: 'http://localhost:8082',
    })

    expect(config.useGateway).toBe(false)
    expect(config.identity.baseUrl).toBe('http://localhost:8080')
    expect(config.course.baseUrl).toBe('http://localhost:8081')
    expect(config.student.baseUrl).toBe('http://localhost:8082')
    expect(config.identity.configurationError).toBeNull()
  })

  it('falls back to the documented defaults', () => {
    const config = resolveApiConfiguration({})

    expect(config.identity.baseUrl).toBe('http://localhost:8080')
    expect(config.course.baseUrl).toBe('http://localhost:8081')
    expect(config.student.baseUrl).toBe('http://localhost:8082')
    expect(config.gatewayUrl).toBe('http://localhost:8088')
  })

  it('still honours the legacy variable of the identity service', () => {
    const config = resolveApiConfiguration({
      VITE_API_BASE_URL: 'http://identity.test:9090',
    })

    expect(config.identity.baseUrl).toBe('http://identity.test:9090')
  })

  it('routes every service through the gateway without a prefix', () => {
    const config = resolveApiConfiguration({
      VITE_USE_API_GATEWAY: 'true',
      VITE_API_GATEWAY_URL: 'http://localhost:8088',
    })

    expect(config.useGateway).toBe(true)
    expect(config.identity.baseUrl).toBe('http://localhost:8088')
    expect(config.identity.pathPrefix).toBe('')
    expect(config.identity.configurationError).toBeNull()
    expect(config.course.configurationError).toBeNull()
    expect(config.student.configurationError).toBeNull()
  })

  it('rejects a prefix that repeats the api path of the service', () => {
    const config = resolveApiConfiguration({
      VITE_USE_API_GATEWAY: 'true',
      VITE_GATEWAY_IDENTITY_PATH: '/api/auth',
    })

    // The request would have ended up at /api/auth/api/auth/login.
    expect(config.identity.configurationError).toContain(
      'VITE_GATEWAY_IDENTITY_PATH',
    )
    expect(config.identity.configurationError).toContain('/api/auth')
    expect(config.identity.pathPrefix).toBe('')
  })

  it('accepts a prefix that mounts the service below another segment', () => {
    const config = resolveApiConfiguration({
      VITE_USE_API_GATEWAY: 'true',
      VITE_GATEWAY_IDENTITY_PATH: '/identity',
    })

    expect(config.identity.configurationError).toBeNull()
    expect(config.identity.pathPrefix).toBe('/identity')
    expect(config.identity.baseUrl).toBe('http://localhost:8088')
  })

  it('trims a trailing slash of a prefix', () => {
    const config = resolveApiConfiguration({
      VITE_USE_API_GATEWAY: 'true',
      VITE_GATEWAY_COURSE_PATH: '/course/',
    })

    expect(config.course.pathPrefix).toBe('/course')
  })

  it('removes a trailing slash of a base url', () => {
    const config = resolveApiConfiguration({
      VITE_IDENTITY_API_URL: 'http://localhost:8080/',
    })

    expect(config.identity.baseUrl).toBe('http://localhost:8080')
  })
})
