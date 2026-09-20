import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import DownloadButton from "../components/DownloadButton";
import FunnelChart from "../components/FunnelChart";
import MetricCard from "../components/MetricCard";
import SwitchingFlow from "../components/SwitchingFlow";

const funnel = [
  ["Cart Add", 10000],
  ["Checkout", 9000],
  ["Address", 8000],
  ["Payment", 6000],
  ["Submit", 4500],
  ["Complete", 4000],
];

const trend = [
  { m: "Jul", drop: 14, repeat: 13.5, switch: 22 },
  { m: "Aug", drop: 15.2, repeat: 13, switch: 23.5 },
  { m: "Sep", drop: 16.1, repeat: 12.8, switch: 24.8 },
  { m: "Oct", drop: 17.4, repeat: 12.4, switch: 25.9 },
  { m: "Nov", drop: 18, repeat: 12, switch: 27 },
];

const channels = {
  App: { dropoff: 22, repeat: 10, switch: 30 },
  Web: { dropoff: 16, repeat: 11, switch: 24 },
  Call: { dropoff: 26, repeat: 18, switch: 35 },
  Branch: { dropoff: 12, repeat: 8, switch: 18 },
};

export default function OverallReport() {
  const chartData = Object.entries(channels).map(([channel, value]) => ({
    channel,
    dropoff: value.dropoff,
    repeat: value.repeat,
    switch: value.switch,
  }));

  return (
    <main className="wrap page">
      <Link to="/" className="back-link">
        ← Back to Reports
      </Link>

      <div className="head">
        <div>
          <small>EXECUTIVE SNAPSHOT</small>
          <h1>Overall report</h1>
          <p>Company-wide health across all channels · Last 30 days</p>
        </div>

        <DownloadButton />
      </div>

      <div className="metrics">
        <MetricCard label="Total customers" value="100,000" />
        <MetricCard label="Drop-off" value="18%" />
        <MetricCard label="Repeat contact" value="12%" />
        <MetricCard label="Channel switch" value="27%" />
        <MetricCard label="Unresolved" value="8%" />
      </div>

      <div className="columns">
        <FunnelChart data={funnel} />

        <section className="card">
          <h2>Performance trend</h2>
          <p>Monthly movement across key metrics</p>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="#edf0f4" vertical={false} />
                <XAxis dataKey="m" />
                <YAxis unit="%" />
                <Tooltip />
                <Line dataKey="drop" stroke="#fa6041" strokeWidth={3} />
                <Line dataKey="repeat" stroke="#0d9488" strokeWidth={3} />
                <Line dataKey="switch" stroke="#ffb23e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="columns">
        <section className="card">
          <h2>Channel comparison</h2>
          <p>Drop-off, repeat and switching rates</p>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

        <SwitchingFlow />
      </div>
    </main>
  );
}
