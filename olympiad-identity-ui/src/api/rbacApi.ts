import { apiClient } from './client'

/**
 * Diagnostic endpoints of `RbacTestController`. They answer with a small
 * payload when the caller owns the required authority and with HTTP 403
 * otherwise, which makes them a direct way to show the effective RBAC state of
 * the signed-in user.
 */
export interface RbacProbe {
  message: string
  resource?: string
}

export interface RbacApi {
  probeUserRead(): Promise<RbacProbe>
  probePermissionManagement(): Promise<RbacProbe>
}

export const rbacApi: RbacApi = {
  async probeUserRead(): Promise<RbacProbe> {
    const response = await apiClient.get<RbacProbe>('/api/rbac-test/users')
    return response.data
  },

  async probePermissionManagement(): Promise<RbacProbe> {
    const response = await apiClient.get<RbacProbe>(
      '/api/rbac-test/permission-management',
    )
    return response.data
  },
}
