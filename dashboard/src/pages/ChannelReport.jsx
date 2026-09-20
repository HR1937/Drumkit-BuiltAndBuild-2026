import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import DownloadButton from "../components/DownloadButton";
import MetricCard from "../components/MetricCard";
import FunnelChart from "../components/FunnelChart";

const channels = {
  App: {
    customers: 45000,
    dropoff: 22,
    repeat: 10,
    switch: 30,
    unresolved: 7,
    funnel: [
      ["Open App", 45000],
      ["Browse", 40000],
      ["Cart", 30000],
      ["Checkout", 22000],
      ["Payment", 17000],
      ["Complete", 13000],
    ],
  },
  Web: {
    customers: 55000,
    dropoff: 16,
    repeat: 11,
    switch: 24,
    unresolved: 6.5,
    funnel: [
      ["Land", 55000],
      ["Browse", 50000],
      ["Cart", 40000],
      ["Checkout", 32000],
      ["Payment", 26000],
      ["Complete", 22000],
    ],
  },
  Call: {
    customers: 28000,
    dropoff: 26,
    repeat: 18,
    switch: 35,
    unresolved: 12,
    funnel: [
      ["Dial", 28000],
      ["IVR", 24000],
      ["Queued", 20000],
      ["Agent", 16000],
      ["Resolved", 12000],
    ],
  },
  Branch: {
    customers: 12000,
    dropoff: 12,
    repeat: 8,
    switch: 18,
    unresolved: 5,
    funnel: [
      ["Enter", 12000],
      ["Token", 11000],
      ["Agent", 10000],
      ["Resolved", 9000],
    ],
  },
};

export default function ChannelReport() {
  const [selected, setSelected] = useState("App");
  const data = channels[selected];

  const comparison = Object.entries(channels).map(([channel, values]) => ({
    channel,
    dropoff: values.dropoff,
    repeat: values.repeat,
    switch: values.switch,
  }));

  return (
    <main className="wrap page">
      <Link to="/" className="back-link">
        ← Back to Reports
      </Link>

      <div className="head">
        <div>
          <small>CHANNEL INTELLIGENCE</small>
          <h1>Channel report</h1>
          <p>Compare conversion and service health by channel</p>
        </div>

        <DownloadButton />
      </div>

      <div className="tabs">
        {Object.keys(channels).map((key) => (
          <button
            key={key}
            className={selected === key ? "active" : ""}
            onClick={() => setSelected(key)}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="metrics">
        <MetricCard label="Customers" value={data.customers.toLocaleString()} />
        <MetricCard label="Drop-off" value={`${data.dropoff}%`} />
        <MetricCard label="Repeat contact" value={`${data.repeat}%`} />
        <MetricCard label="Switch rate" value={`${data.switch}%`} />
        <MetricCard label="Unresolved" value={`${data.unresolved}%`} />
      </div>

      <div className="columns">
        <FunnelChart data={data.funnel} />

        <section className="card">
          <h2>All-channel benchmark</h2>
          <p>Compare this channel against the complete network</p>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison}>
                <CartesianGrid stroke="#edf0f4" vertical={false} />
                <XAxis dataKey="channel" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="dropoff" fill="#fa6041" radius={[5, 5, 0, 0]} />
                <Bar dataKey="repeat" fill="#0d9488" radius={[5, 5, 0, 0]} />
                <Bar dataKey="switch" fill="#ffb23e" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </main>
  );
}
