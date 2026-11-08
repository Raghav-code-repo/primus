import { Link } from "react-router-dom";

interface CourseItem {
  id: string;
  letter: string;
  bg: string;
  color: string;
  title: string;
  count: string;
  link: string;
}

const DEFAULT_COURSES: CourseItem[] = [
  {
    id: "c1",
    letter: "U",
    bg: "#fef08a",
    color: "#854d0e",
    title: "UI/UX & Geometry Logic",
    count: "30+ Lessons",
    link: "/courses",
  },
  {
    id: "c2",
    letter: "M",
    bg: "#fce7f3",
    color: "#9d174d",
    title: "Advanced Olympiad Algebra",
    count: "25+ Lessons",
    link: "/courses",
  },
  {
    id: "c3",
    letter: "W",
    bg: "#ccfbf1",
    color: "#0f766e",
    title: "Algorithmic Informatics",
    count: "30+ Lessons",
    link: "/courses",
  },
  {
    id: "c4",
    letter: "M",
    bg: "#e0e7ff",
    color: "#3730a3",
    title: "Number Theory & Combinatorics",
    count: "50+ Lessons",
    link: "/courses",
  },
];

interface EduLearnPopularCoursesProps {
  title?: string;
  viewAllLink?: string;
  courses?: CourseItem[];
}

export function EduLearnPopularCourses({
  title = "Popular Courses",
  viewAllLink = "/courses",
  courses = DEFAULT_COURSES,
}: EduLearnPopularCoursesProps) {
  return (
    <div className="edulearn-card">
      <div className="edulearn-card__header">
        <h3 className="edulearn-card__title">{title}</h3>
        <Link to={viewAllLink} className="edulearn-card__link">
          All Courses
        </Link>
      </div>

      <div className="edulearn-course-list">
        {courses.map((item) => (
          <div key={item.id} className="edulearn-course-row">
            <div
              className="edulearn-course-row__badge"
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.letter}
            </div>

            <div className="edulearn-course-row__info">
              <h4 className="edulearn-course-row__title">{item.title}</h4>
              <span className="edulearn-course-row__meta">{item.count}</span>
            </div>

            <Link to={item.link} className="edulearn-course-row__btn">
              View Courses
            </Link>

            <button
              type="button"
              className="edulearn-course-row__more"
              aria-label="Course options"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
