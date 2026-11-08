import { contentClient } from './client'
import type {
  CreateLessonRequest,
  UpdateLessonRequest,
  Lesson,
  ContentResource,
  CreateContentResourceRequest,
} from '../types/content'

export interface ContentApi {
  list(): Promise<Lesson[]>
  listByCourse(courseId: string): Promise<Lesson[]>
  listPublishedByCourse(courseId: string): Promise<Lesson[]>
  get(id: string): Promise<Lesson>
  create(payload: CreateLessonRequest): Promise<Lesson>
  update(id: string, payload: UpdateLessonRequest): Promise<Lesson>
  remove(id: string): Promise<void>
  listResources(lessonId: string): Promise<ContentResource[]>
  createResource(lessonId: string, payload: CreateContentResourceRequest): Promise<ContentResource>
}

export const contentApi: ContentApi = {
  async list(): Promise<Lesson[]> {
    const response = await contentClient.get<Lesson[]>('/api/content/lessons')
    return response.data
  },

  async listByCourse(courseId: string): Promise<Lesson[]> {
    const response = await contentClient.get<Lesson[]>('/api/content/lessons/course/' + courseId)
    return response.data
  },

  async listPublishedByCourse(courseId: string): Promise<Lesson[]> {
    const response = await contentClient.get<Lesson[]>('/api/content/lessons/course/' + courseId + '/published')
    return response.data
  },

  async get(id: string): Promise<Lesson> {
    const response = await contentClient.get<Lesson>('/api/content/lessons/' + id)
    return response.data
  },

  async create(payload: CreateLessonRequest): Promise<Lesson> {
    const response = await contentClient.post<Lesson>('/api/content/lessons', payload)
    return response.data
  },

  async update(id: string, payload: UpdateLessonRequest): Promise<Lesson> {
    const response = await contentClient.put<Lesson>('/api/content/lessons/' + id, payload)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await contentClient.delete('/api/content/lessons/' + id)
  },

  async listResources(lessonId: string): Promise<ContentResource[]> {
    const response = await contentClient.get<ContentResource[]>('/api/content/lessons/' + lessonId + '/resources')
    return response.data
  },

  async createResource(lessonId: string, payload: CreateContentResourceRequest): Promise<ContentResource> {
    const response = await contentClient.post<ContentResource>('/api/content/lessons/' + lessonId + '/resources', payload)
    return response.data
  },
}
