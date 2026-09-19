import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Proof from "./components/Proof";

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero />
        <Proof />
        {/* Next sections get added here as you share their content */}
      </main>
    </div>
  );
}