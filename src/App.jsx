import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureShowcase from "./components/FeatureShowcase";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function App() {
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