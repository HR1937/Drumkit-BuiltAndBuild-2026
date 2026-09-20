import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReportLanding from "./pages/ReportLanding";
import OverallReport from "./pages/OverallReport";
import ChannelReport from "./pages/ChannelReport";
import IndividualReport from "./pages/IndividualReport";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<ReportLanding />} />
        <Route path="/overall" element={<OverallReport />} />
        <Route path="/channel" element={<ChannelReport />} />
        <Route path="/customer" element={<IndividualReport />} />
      </Routes>
    </div>
  );
}
