import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureShowcase from "./components/FeatureShowcase";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
<<<<<<< HEAD
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
=======
import FeatureShowcase from "./components/FeatureShowcase";
import Registration from "./components/Registration";
import Login from "./components/Login";
>>>>>>> b9fbf6b (Add registration and login pages)

function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <FeatureShowcase />
        <Pricing />
        <FAQ />
        {/* Next sections get added here as you share their content */}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}