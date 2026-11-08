import { Link } from "react-router-dom";

interface Instructor {
  id: string;
  name: string;
  coursesCount: string;
  avatarBg: string;
}

const INSTRUCTORS: Instructor[] = [
  {
    id: "i1",
    name: "Nil Yeager",
    coursesCount: "5 Olympiad Courses",
    avatarBg: "#dbeafe",
  },
  {
    id: "i2",
    name: "Theron Trump",
    coursesCount: "5 Advanced Courses",
    avatarBg: "#fee2e2",
  },
  {
    id: "i3",
    name: "Tyler Mark",
    coursesCount: "5 Geometry Courses",
    avatarBg: "#fef3c7",
  },
  {
    id: "i4",
    name: "Johen Mark",
    coursesCount: "5 Science Courses",
    avatarBg: "#dcfce7",
  },
];

export function EduLearnTopInstructors() {
  return (
    <div className="edulearn-card">
      <div className="edulearn-card__header">
        <h3 className="edulearn-card__title">Best Instructors</h3>
        <Link to="/courses" className="edulearn-card__link">
          See All
        </Link>
      </div>

      <div className="edulearn-instructor-list">
        {INSTRUCTORS.map((item, index) => (
          <div key={item.id} className="edulearn-instructor-row">
            <div
              className="edulearn-instructor-row__avatar"
              style={{ backgroundColor: item.avatarBg }}
              aria-hidden="true"
            >
              {/* Modern Vector Avatar Icon */}
              <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
                <circle cx="18" cy="18" r="17" fill={item.avatarBg} />
                <circle cx="18" cy="14" r="6" fill="#334155" />
                <path
                  d="M9 28c0-4.42 4.03-8 9-8s9 3.58 9 8"
                  fill={index % 2 === 0 ? "#f97316" : "#0284c7"}
                />
                {/* Glasses / Hair variation */}
                {index === 0 ? (
                  <rect
                    x="13"
                    y="12"
                    width="10"
                    height="3"
                    rx="1.5"
                    fill="#0f172a"
                  />
                ) : null}
              </svg>
            </div>

            <div className="edulearn-instructor-row__info">
              <h4 className="edulearn-instructor-row__name">{item.name}</h4>
              <span className="edulearn-instructor-row__count">
                {item.coursesCount}
              </span>
            </div>

            <Link to="/courses" className="edulearn-instructor-row__btn">
              Courses
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
