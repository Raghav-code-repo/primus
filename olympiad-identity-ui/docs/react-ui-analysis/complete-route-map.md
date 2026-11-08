# Complete Route Map

Source: `src/routes/AppRoutes.tsx`

| URL | Component | Auth | Role/Permission | Layout |
|---|---|---|---|---|
| / | Navigate -> /dashboard | - | - | - |
| /login | LoginPage | PublicOnly | - | none |
| /register | RegisterPage | PublicOnly | - | none |
| /dashboard | DashboardPage | Protected | - | AppLayout |
| /student/dashboard | StudentDashboardPage | Protected | ROLE_STUDENT | AppLayout |
| /student/profile | StudentProfilePage | Protected | ROLE_STUDENT | AppLayout |
| /student/courses | MyCoursesPage | Protected | ROLE_STUDENT | AppLayout |
| /faculty/dashboard | FacultyDashboardPage | Protected | ROLE_TEACHER | AppLayout |
| /parent/dashboard | ParentDashboardPage | Protected | - | AppLayout |
| /admin/dashboard | AdminDashboardPage | Protected | ROLE_ADMIN | AppLayout |
| /courses | CourseCataloguePage | Protected | - | AppLayout |
| /courses/:id | CourseCatalogueDetailPage | Protected | - | AppLayout |
| /profile | ProfilePage | Protected | - | AppLayout |
| /admin | AdminPage | Protected | ROLE_ADMIN | AppLayout |
| /admin/courses | CourseManagementPage | Protected | COURSE_READ | AppLayout |
| /admin/courses/new | CourseFormPage (create) | Protected | COURSE_CREATE | AppLayout |
| /admin/courses/:id | CourseManagementDetailPage | Protected | COURSE_READ | AppLayout |
| /admin/courses/:id/edit | CourseFormPage (edit) | Protected | COURSE_UPDATE | AppLayout |
| /admin/content | ContentManagementPage | Protected | ROLE_ADMIN | AppLayout |
| /live-classes | LiveClassesPage | Protected | LIVE_CLASS_READ | AppLayout |
| /live-classes/:id/room | LiveClassRoomPage | Protected | LIVE_CLASS_JOIN | AppLayout |
| /live-classes/create | CreateLiveClassPage | Protected | LIVE_CLASS_CREATE | AppLayout |
| /live-classes/:id/edit | CreateLiveClassPage | Protected | LIVE_CLASS_UPDATE | AppLayout |
| /unauthorized | UnauthorizedPage | Public | - | none |
| * | NotFoundPage | Public | - | none |

Note: live-class routes are NOT nested under the AppLayout protected layout (placed outside the layout Route). Confirmed from AppRoutes.tsx structure.
