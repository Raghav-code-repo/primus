# API Integration Map

Axios clients in src/api/client.ts: apiClient (identity), courseClient (course), studentClient (student), contentClient (content), liveClassClient (live class). Config: src/config/apiConfig.ts.

API modules: authApi, adminApi, catalogApi, courseApi, enrollmentApi, studentApi, contentApi, classroomApi, liveClassApi, rbacApi. Endpoints per module; see source. Error handling via ApiError, toApiError, networkError/timeoutError. 401 triggers unauthorized handler.

Confirmed: exact endpoint paths not enumerated here; inspect each *Api.ts. Assumption: gateway prefix /api.
