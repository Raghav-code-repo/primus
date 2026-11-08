import { apiClient } from './client'
import type {
  AdminUserResponse,
  PermissionResponse,
  RoleResponse,
} from '../types/auth'

export interface AdminApi {
  listUsers(): Promise<AdminUserResponse[]>
  getUser(id: string): Promise<AdminUserResponse>
  createUser(request: { email: string; password: string; firstName: string; lastName: string }): Promise<AdminUserResponse>
  updateUser(id: string, request: { firstName: string; lastName: string }): Promise<AdminUserResponse>
  updateUserStatus(id: string, status: string): Promise<AdminUserResponse>
  listRoles(): Promise<RoleResponse[]>
  createRole(request: { name: string; description?: string }): Promise<RoleResponse>
  listPermissions(): Promise<PermissionResponse[]>
  createPermission(request: { code: string; description?: string }): Promise<PermissionResponse>
  assignRole(userId: string, roleId: string): Promise<void>
  removeRole(userId: string, roleId: string): Promise<void>
  assignPermission(roleId: string, permissionId: string): Promise<void>
  removePermission(roleId: string, permissionId: string): Promise<void>
}

export const adminApi: AdminApi = {
  async listUsers() {
    const r = await apiClient.get<AdminUserResponse[]>('/api/admin/users')
    return r.data
  },
  async getUser(id) {
    const r = await apiClient.get<AdminUserResponse>(`/api/admin/users/${id}`)
    return r.data
  },
  async createUser(request) {
    const r = await apiClient.post<AdminUserResponse>('/api/admin/users', request)
    return r.data
  },
  async updateUser(id, request) {
    const r = await apiClient.put<AdminUserResponse>(`/api/admin/users/${id}`, request)
    return r.data
  },
  async updateUserStatus(id, status) {
    const r = await apiClient.patch<AdminUserResponse>(`/api/admin/users/${id}/status`, { status })
    return r.data
  },
  async listRoles() {
    const r = await apiClient.get<RoleResponse[]>('/api/admin/roles')
    return r.data
  },
  async createRole(request) {
    const r = await apiClient.post<RoleResponse>('/api/admin/roles', request)
    return r.data
  },
  async listPermissions() {
    const r = await apiClient.get<PermissionResponse[]>('/api/admin/permissions')
    return r.data
  },
  async createPermission(request) {
    const r = await apiClient.post<PermissionResponse>('/api/admin/permissions', request)
    return r.data
  },
  async assignRole(userId, roleId) {
    await apiClient.post(`/api/admin/users/${userId}/roles/${roleId}`)
  },
  async removeRole(userId, roleId) {
    await apiClient.delete(`/api/admin/users/${userId}/roles/${roleId}`)
  },
  async assignPermission(roleId, permissionId) {
    await apiClient.post(`/api/admin/roles/${roleId}/permissions/${permissionId}`)
  },
  async removePermission(roleId, permissionId) {
    await apiClient.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`)
  },
}