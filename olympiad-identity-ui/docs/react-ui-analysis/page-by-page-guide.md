# Page-by-Page Guide

Pages are in src/pages. Each lazy-loaded in AppRoutes. Common patterns: useAsyncResource, React Hook Form + Zod, Axios APIs, loading/error/empty states via LoadingScreen/Skeleton/EmptyState/Alert.

Key pages:
- LoginPage/RegisterPage: auth forms (authSchemas), call authApi.login/register.
- DashboardPage: role-based redirect/overview.
- StudentDashboardPage, FacultyDashboardPage, AdminDashboardPage, ParentDashboardPage: role dashboards.
- CourseCataloguePage/Detail: public-ish catalog, enrollment.
- CourseManagementPage/Detail/Form: admin course CRUD (courseApi).
- ContentManagementPage: content (contentApi).
- LiveClassesPage, CreateLiveClassPage, LiveClassRoomPage: live classes.
- ProfilePage, StudentProfilePage: profile (studentApi).
- AdminPage: admin tools.
- MyCoursesPage: enrollments.

Forms use React Hook Form + Zod resolvers. Buttons trigger API calls. Tables list resources. Dialogs for confirmations. Navigation via react-router Link/useNavigate.

Loading/error/empty states: confirmed via component imports (LoadingScreen, EmptyState, Alert, Skeleton). Assumptions: exact per-page state handling not fully inspected; see source.
