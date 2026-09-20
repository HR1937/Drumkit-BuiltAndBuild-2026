import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReportCard({ icon: Icon, title, description, to }) {
  return (
    <Link className="report" to={to}>
      <div className="icon">
        <Icon />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span>
        Open report <ArrowRight size={15} />
      </span>
    </Link>
  );
}
