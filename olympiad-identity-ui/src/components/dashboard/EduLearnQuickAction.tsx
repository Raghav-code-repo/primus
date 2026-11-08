import { Link } from "react-router-dom";

interface EduLearnQuickActionProps {
  prompt?: string;
  buttonLabel?: string;
  buttonTo?: string;
  stat1Label?: string;
  stat1Value?: string | number;
  stat2Label?: string;
  stat2Value?: string | number;
}

/**
 * Top-right action box accompanying the hero banner in EduLearn layout.
 */
export function EduLearnQuickAction({
  prompt = "Have More knowledge to share?",
  buttonLabel = "+ Create New Course",
  buttonTo = "/admin/courses/new",
  stat1Label = "Courses In Progress",
  stat1Value = "5",
  stat2Label = "Forum Discussions",
  stat2Value = "25",
}: EduLearnQuickActionProps) {
  return (
    <div className="edulearn-quick-action">
      <h3 className="edulearn-quick-action__prompt">{prompt}</h3>

      <Link to={buttonTo} className="edulearn-quick-action__btn">
        {buttonLabel}
      </Link>

      <div className="edulearn-quick-action__stats">
        <div className="edulearn-quick-action__box">
          <span className="edulearn-quick-action__box-label">{stat1Label}</span>
          <span className="edulearn-quick-action__box-val">{stat1Value}</span>
        </div>

        <div className="edulearn-quick-action__box">
          <span className="edulearn-quick-action__box-label">{stat2Label}</span>
          <span className="edulearn-quick-action__box-val">{stat2Value}</span>
        </div>
      </div>
    </div>
  );
}
