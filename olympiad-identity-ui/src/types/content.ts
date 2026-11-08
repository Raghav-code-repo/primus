/**
 * Types mirroring the Content Service DTOs.
 */
export const LESSON_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const RESOURCE_TYPES = ['VIDEO', 'PDF', 'DOCUMENT', 'LINK', 'IMAGE', 'AUDIO'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface CreateLessonRequest {
  courseId: string;
  subject: string;
  grade: string;
  title: string;
  description?: string | null;
  chapterNumber: number;
}

export interface UpdateLessonRequest {
  subject: string;
  grade: string;
  title: string;
  description?: string | null;
  chapterNumber: number;
  status: LessonStatus;
}

export interface Lesson {
  id: string;
  courseId: string;
  subject: string;
  grade: string;
  title: string;
  description: string | null;
  chapterNumber: number;
  status: LessonStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentResource {
  id: string;
  lessonId: string;
  type: ResourceType;
  title: string;
  url: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentResourceRequest {
  type: ResourceType;
  title: string;
  url: string;
  displayOrder: number;
}

export type ContentResourceType = ResourceType;
