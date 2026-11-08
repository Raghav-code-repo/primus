export interface ServiceEndpoint {
  baseUrl: string;
  pathPrefix: string;
  configurationError: string | null;
}

export interface ApiEnvironment {
  VITE_IDENTITY_API_URL?: string;
  VITE_COURSE_API_URL?: string;
  VITE_STUDENT_API_URL?: string;
  VITE_CONTENT_API_URL?: string;
  VITE_LIVE_CLASS_API_URL?: string;

  VITE_API_GATEWAY_URL?: string;
  VITE_USE_API_GATEWAY?: string;
  VITE_API_BASE_URL?: string;

  VITE_GATEWAY_IDENTITY_PATH?: string;
  VITE_GATEWAY_COURSE_PATH?: string;
  VITE_GATEWAY_STUDENT_PATH?: string;
  VITE_GATEWAY_CONTENT_PATH?: string;
  VITE_GATEWAY_LIVE_CLASS_PATH?: string;
}

export interface ApiConfiguration {
  useGateway: boolean;
  gatewayUrl: string;
  identity: ServiceEndpoint;
  course: ServiceEndpoint;
  student: ServiceEndpoint;
  content: ServiceEndpoint;
  liveClass: ServiceEndpoint;
}

const API_PATH = {
  identity: "/api/auth",
  course: "/api/courses",
  student: "/api/students",
  content: "/api/content",
  liveClass: "/api/live-classes",
} as const;

function normalizeBaseUrl(value?: string): string {
  return (value ?? "").trim().replace(/\/+$/, "");
}

function normalizePathPrefix(value?: string): string {
  const trimmed = (value ?? "").trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeadingSlash.replace(/\/+$/, "");
}

function isEnabled(value?: string): boolean {
  return value?.trim().toLowerCase() === "true";
}

function createEndpoint(
  baseUrl: string,
  pathPrefix: string,
  apiPath: string,
): ServiceEndpoint {
  if (!baseUrl) {
    return {
      baseUrl: "",
      pathPrefix,
      configurationError: "The API base URL is not configured.",
    };
  }

  // Avoid requests such as /api/content/api/content/lessons.
  if (pathPrefix === apiPath || pathPrefix.endsWith(apiPath)) {
    return {
      baseUrl,
      pathPrefix,
      configurationError:
        `The gateway prefix "${pathPrefix}" duplicates the API path "${apiPath}". ` +
        "Leave the gateway prefix empty when the gateway routes the original API path.",
    };
  }

  return {
    baseUrl,
    pathPrefix,
    configurationError: null,
  };
}

export function resolveApiConfiguration(env: ApiEnvironment): ApiConfiguration {
  const useGateway = isEnabled(env.VITE_USE_API_GATEWAY);

  const gatewayUrl = normalizeBaseUrl(
    env.VITE_API_GATEWAY_URL || "http://localhost:8088",
  );

  const legacyBaseUrl = normalizeBaseUrl(env.VITE_API_BASE_URL);

  if (useGateway) {
    // The gateway forwards the original /api/... request path.
    // Leave each service path prefix empty by default.
    return {
      useGateway: true,
      gatewayUrl,

      identity: createEndpoint(
        gatewayUrl,
        normalizePathPrefix(env.VITE_GATEWAY_IDENTITY_PATH),
        API_PATH.identity,
      ),

      course: createEndpoint(
        gatewayUrl,
        normalizePathPrefix(env.VITE_GATEWAY_COURSE_PATH),
        API_PATH.course,
      ),

      student: createEndpoint(
        gatewayUrl,
        normalizePathPrefix(env.VITE_GATEWAY_STUDENT_PATH),
        API_PATH.student,
      ),

      content: createEndpoint(
        gatewayUrl,
        normalizePathPrefix(env.VITE_GATEWAY_CONTENT_PATH),
        API_PATH.content,
      ),

      liveClass: createEndpoint(
        gatewayUrl,
        normalizePathPrefix(env.VITE_GATEWAY_LIVE_CLASS_PATH),
        API_PATH.liveClass,
      ),
    };
  }

  return {
    useGateway: false,
    gatewayUrl,

    identity: createEndpoint(
      normalizeBaseUrl(env.VITE_IDENTITY_API_URL) ||
        legacyBaseUrl ||
        "http://localhost:8080",
      "",
      API_PATH.identity,
    ),

    course: createEndpoint(
      normalizeBaseUrl(env.VITE_COURSE_API_URL) ||
        legacyBaseUrl ||
        "http://localhost:8081",
      "",
      API_PATH.course,
    ),

    student: createEndpoint(
      normalizeBaseUrl(env.VITE_STUDENT_API_URL) ||
        legacyBaseUrl ||
        "http://localhost:8082",
      "",
      API_PATH.student,
    ),

    content: createEndpoint(
      normalizeBaseUrl(env.VITE_CONTENT_API_URL) ||
        legacyBaseUrl ||
        "http://localhost:8083",
      "",
      API_PATH.content,
    ),

    liveClass: createEndpoint(
      normalizeBaseUrl(env.VITE_LIVE_CLASS_API_URL) ||
        legacyBaseUrl ||
        "http://localhost:8084",
      "",
      API_PATH.liveClass,
    ),
  };
}

const env: ApiEnvironment = {
  VITE_IDENTITY_API_URL: import.meta.env.VITE_IDENTITY_API_URL,
  VITE_COURSE_API_URL: import.meta.env.VITE_COURSE_API_URL,
  VITE_STUDENT_API_URL: import.meta.env.VITE_STUDENT_API_URL,
  VITE_CONTENT_API_URL: import.meta.env.VITE_CONTENT_API_URL,
  VITE_LIVE_CLASS_API_URL: import.meta.env.VITE_LIVE_CLASS_API_URL,

  VITE_API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL,
  VITE_USE_API_GATEWAY: import.meta.env.VITE_USE_API_GATEWAY,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,

  VITE_GATEWAY_IDENTITY_PATH: import.meta.env.VITE_GATEWAY_IDENTITY_PATH,
  VITE_GATEWAY_COURSE_PATH: import.meta.env.VITE_GATEWAY_COURSE_PATH,
  VITE_GATEWAY_STUDENT_PATH: import.meta.env.VITE_GATEWAY_STUDENT_PATH,
  VITE_GATEWAY_CONTENT_PATH: import.meta.env.VITE_GATEWAY_CONTENT_PATH,
  VITE_GATEWAY_LIVE_CLASS_PATH: import.meta.env.VITE_GATEWAY_LIVE_CLASS_PATH,
};

export const apiConfiguration: ApiConfiguration = resolveApiConfiguration(env);

export const configurationIssues = [
  apiConfiguration.identity.configurationError,
  apiConfiguration.course.configurationError,
  apiConfiguration.student.configurationError,
  apiConfiguration.content.configurationError,
].filter((issue): issue is string => issue !== null);

export const configurationWarnings: string[] = apiConfiguration.useGateway
  ? [
      "Gateway mode is enabled. Admin and RBAC test endpoints may require additional gateway routes if the frontend uses them.",
      "Course requests require appropriate permissions, such as COURSE_READ.",
      "Content requests require the permissions configured for the Content Service endpoints.",
    ]
  : [];

// Temporary diagnostic output: remove after confirming the configuration.
if (import.meta.env.DEV) {
  console.info("[API Configuration Debug]", apiConfiguration);
}
