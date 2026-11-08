import { studentClient } from './client'
import type {
  CatalogCourse,
  CatalogPage,
  CatalogQuery,
} from '../types/course'

/**
 * Endpoints of `CourseCatalogController`
 * (com.olympiad.student.controller.CourseCatalogController).
 * All paths are relative to the Student Service base URL.
 *
 * The Student Service does not own the courses: it forwards the read to the
 * Course Service and returns a stable projection of it. The controller applies
 * the publication rule of the backend: when no status is requested, only
 * `PUBLISHED` courses are returned
 * (`CourseCatalogService.DEFAULT_STATUS`). The frontend therefore does not
 * decide on its own which courses a student may see - the backend does.
 */
export interface CatalogApi {
  /** GET /api/courses - the published courses, optionally filtered by subject. */
  list(query?: CatalogQuery): Promise<CatalogPage>
  /** GET /api/courses/{id} - a single course. */
  get(id: string): Promise<CatalogCourse>
}

/** The Student Service rejects a page size that is not between 1 and 100. */
const MAX_PAGE_SIZE = 100

/**
 * The status that is requested explicitly.
 *
 * The Student Service defaults to `PUBLISHED`, so sending it changes nothing
 * there. Through the API Gateway the same path is served by the Course
 * Service, which returns every status when no status is sent. Sending the
 * status keeps the publication rule of the backend in both cases.
 */
const PUBLISHED_STATUS = 'PUBLISHED'

/**
 * The page wrapper of the Student Service (`CoursePageResponse`) and the page
 * wrapper of the Course Service (the Spring Data `Page`) do not use the same
 * field names: the Spring page names the index `number`, the Student Service
 * names it `page`. Both are normalised into {@link CatalogPage}.
 */
interface RawCatalogPage {
  content?: unknown
  page?: unknown
  number?: unknown
  size?: unknown
  totalElements?: unknown
  totalPages?: unknown
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizePage(raw: RawCatalogPage): CatalogPage {
  return {
    content: Array.isArray(raw.content) ? (raw.content as CatalogCourse[]) : [],
    page: readNumber(raw.page, readNumber(raw.number, 0)),
    size: readNumber(raw.size, 0),
    totalElements: readNumber(raw.totalElements, 0),
    totalPages: readNumber(raw.totalPages, 0),
  }
}

export const catalogApi: CatalogApi = {
  async list(query: CatalogQuery = {}): Promise<CatalogPage> {
    const params: Record<string, string | number> = {
      status: PUBLISHED_STATUS,
    }

    if (query.subject?.trim()) {
      params.subject = query.subject.trim()
    }
    if (typeof query.page === 'number' && query.page >= 0) {
      params.page = query.page
    }
    if (typeof query.size === 'number' && query.size > 0) {
      params.size = Math.min(query.size, MAX_PAGE_SIZE)
    }

    const response = await studentClient.get<RawCatalogPage>('/api/courses', {
      params,
    })
    return normalizePage(response.data)
  },

  async get(id: string): Promise<CatalogCourse> {
    const response = await studentClient.get<CatalogCourse>(`/api/courses/${id}`)
    return response.data
  },
}
