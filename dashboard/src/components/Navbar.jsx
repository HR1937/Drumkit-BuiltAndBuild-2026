import { Link } from "react-router-dom";
import { Download } from "lucide-react";

export default function Navbar() {
  return (
    <header>
      <div className="wrap nav">
        <Link className="brand" to="/">Nex<span>jour</span></Link>

        <nav>
          <Link to="/">Reports</Link>
          <Link to="/overall">Overall</Link>
          <Link to="/channel">Channel</Link>
          <Link to="/customer">Customer</Link>
        </nav>

        <button className="primary" onClick={() => window.print()}>
          <Download size={15} /> Export
        </button>
      </div>
    </header>
  );
}
