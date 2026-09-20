import { Users, Radio, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import DownloadButton from "../components/DownloadButton";
import ReportCard from "../components/ReportCard";

export default function ReportLanding() {
  return (
    <main className="wrap page">
      <div className="hero">
        <small>REPORT CENTER</small>
        <h1>Make every customer journey visible.</h1>
        <p>
          Turn complex journey data into clear decisions with attractive, structured
          reports.
        </p>
        <DownloadButton />
      </div>

      <div className="report-grid">
        <ReportCard
          icon={Users}
          title="Overall Report"
          description="Company-wide KPIs and trends"
          to="/overall"
        />

        <ReportCard
          icon={Radio}
          title="Channel Report"
          description="Compare every channel"
          to="/channel"
        />

        <ReportCard
          icon={UserRound}
          title="Customer Journey"
          description="Explore one customer journey"
          to="/customer"
        />
      </div>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link to="/overall" className="primary inline-btn">
          View dashboard
        </Link>
      </div>
    </main>
  );
}
