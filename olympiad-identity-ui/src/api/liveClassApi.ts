import { liveClassClient } from './client'

export interface LiveClass {
  id: string
  courseId: string
  teacherId: string
  title: string
  description?: string | null
  scheduledStart: string
  scheduledEnd: string
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
  roomName: string
  livekitRoomName?: string
  createdAt?: string
  updatedAt?: string
  /** How the current student gained access: ASSIGNED or ENROLLED_COURSE. */
  accessSource?: string
}

export interface CreateLiveClassRequest {
  courseId: string
  teacherId: string
  title: string
  description?: string
  scheduledStart: string
  scheduledEnd: string
}

export interface UpdateLiveClassRequest {
  title?: string
  description?: string
  scheduledStart?: string
  scheduledEnd?: string
}

export interface JoinLiveClassResponse {
  liveClassId: string
  roomName: string
  participantEmail: string
  participantRole: string
  checkedAt: string
  message: string
}

export interface LiveKitTokenResponse {
  token: string
  url: string
  roomName: string
  identity: string
  participantRole: string
  expiresAt: string
}

export async function listLiveClasses(): Promise<LiveClass[]> {
  const response = await liveClassClient.get<LiveClass[]>('/api/live-classes')
  return response.data
}

export async function getLiveClass(id: string): Promise<LiveClass> {
  const response = await liveClassClient.get<LiveClass>(`/api/live-classes/${id}`)
  return response.data
}

export async function createLiveClass(request: CreateLiveClassRequest): Promise<LiveClass> {
  const response = await liveClassClient.post<LiveClass>('/api/live-classes', request)
  return response.data
}

export async function updateLiveClass(id: string, request: UpdateLiveClassRequest): Promise<LiveClass> {
  const response = await liveClassClient.put<LiveClass>(`/api/live-classes/${id}`, request)
  return response.data
}

export async function cancelLiveClass(id: string): Promise<void> {
  await liveClassClient.delete(`/api/live-classes/${id}`)
}

export async function cancelLiveClassPost(id: string): Promise<LiveClass> {
  const response = await liveClassClient.post<LiveClass>(`/api/live-classes/${id}/cancel`)
  return response.data
}

export async function joinLiveClass(id: string): Promise<JoinLiveClassResponse> {
  const response = await liveClassClient.post<JoinLiveClassResponse>(`/api/live-classes/${id}/join`)
  return response.data
}

export async function getLiveKitToken(id: string): Promise<LiveKitTokenResponse> {
  const response = await liveClassClient.post<LiveKitTokenResponse>(`/api/live-classes/${id}/token`)
  return response.data
}

export async function getLiveKitTokenGet(id: string): Promise<LiveKitTokenResponse> {
  const response = await liveClassClient.get<LiveKitTokenResponse>(`/api/live-classes/${id}/token`)
  return response.data
}


