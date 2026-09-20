import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import DownloadButton from "../components/DownloadButton";

const customer = {
  name: "Priya Sharma",
  id: "priya_456",
  email: "priya@email.com",
  phone: "+91 98765-43210",
  events: [
    ["10:00", "App", "Browse Product", ""],
    ["10:05", "App", "Add to Cart", ""],
    ["10:10", "Web", "Checkout Start", "Channel switch"],
    ["10:15", "Web", "Payment Page", ""],
    ["10:20", "Web", "Payment Failed", "Drop-off"],
    ["10:25", "Call", "Support Contact", "Escalation"],
    ["10:35", "Call", "Support Repeat", "Repeat contact"],
    ["11:00", "Web", "Abandoned", "Unresolved"],
  ],
};

const colors = {
  App: "#0d9488",
  Web: "#fa6041",
  Call: "#ffb23e",
};

export default function IndividualReport() {
  const [query, setQuery] = useState("priya_456");
  const [found, setFound] = useState(true);

  function handleSearch() {
    setFound(query.trim() === "priya_456");
  }

  return (
    <main className="wrap page">
      <Link to="/" className="back-link">
        ← Back to Reports
      </Link>

      <div className="head">
        <div>
          <small>CUSTOMER INTELLIGENCE</small>
          <h1>Customer journey</h1>
          <p>A complete view of one customer's experience</p>
        </div>

        <DownloadButton />
      </div>

      <div className="search">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by customer ID"
        />
        <button className="primary" onClick={handleSearch}>Find customer</button>
      </div>

      {!found && <div className="error">No customer found. Try priya_456.</div>}

      {found && (
        <>
          <section className="card">
            <div className="profile">
              <div>
                <h2>{customer.name}</h2>
                <p>Golden ID · {customer.id}</p>
              </div>
              <span className="badge">Journey active · 8 touchpoints</span>
            </div>

            <div className="identifiers">
              <span>{customer.email}</span>
              <span>{customer.phone}</span>
            </div>
          </section>

          <section className="card" style={{ marginTop: "18px" }}>
            <h2>Journey timeline</h2>
            <p>Every interaction in chronological order</p>

            <div className="timeline">
              {customer.events.map(([time, channel, action, flag]) => (
                <div className="event" key={`${time}-${action}`}>
                  <time>{time}</time>
                  <i
                    className="dot"
                    style={{ background: colors[channel] || "#172033" }}
                  />
                  <div>
                    <b>{action}</b>
                    <small>
                      {channel}
                      {flag && ` · ${flag}`}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
