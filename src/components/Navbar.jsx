import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-ink/8 bg-surface/85 shadow-[0_1px_0_0_rgba(18,22,43,0.04)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Wordmark */}
        <a
          href="#"
          style={{ animation: "reveal-down 0.7s cubic-bezier(.16,.84,.44,1) 0s both" }}
          className="group flex items-center font-display text-[1.35rem] font-medium tracking-tight text-ink"
        >
          Nex
          <span className="relative">
            jour
            <svg
              className="absolute -bottom-1.5 left-0 h-[7px] w-full"
              viewBox="0 0 60 8"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M1 5 Q 15 1, 30 4 T 59 3"
                fill="none"
                stroke="url(#navUnderline)"
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
              <defs>
                <linearGradient id="navUnderline" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF5A36" />
                  <stop offset="100%" stopColor="#FFB020" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV_LINKS.map((link, i) => (
            <li
              key={link.label}
              style={{
                animation: `reveal-down 0.6s cubic-bezier(.16,.84,.44,1) ${0.05 * (i + 1)}s both`,
              }}
            >
              <a
                href={link.href}
                className="group relative py-1 text-[0.9rem] text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-thread to-thread-2 transition-all duration-300 group-hover:left-0 group-hover:w-full group-hover:translate-x-0" />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div
          className="hidden items-center gap-5 lg:flex"
          style={{ animation: "reveal-down 0.6s cubic-bezier(.16,.84,.44,1) 0.5s both" }}
        >
          <a
            href="#login"
            className="relative text-[0.9rem] text-muted transition-colors duration-200 hover:text-ink"
          >
            Log In
          </a>
          <a
            href="#signup"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-thread to-thread-2 px-5 py-2.5 text-[0.875rem] font-medium text-white shadow-[0_0_0_0_rgba(255,90,54,0.35)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_0_6px_rgba(255,90,54,0.16)]"
          >
            Sign Up Free
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-ink/8 bg-surface transition-[max-height] duration-300 ease-in-out lg:hidden ${
          open ? "max-h-[30rem]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-[0.95rem] text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2 flex items-center gap-5 border-t border-ink/8 pt-4">
            <a href="#login" className="text-[0.95rem] text-muted hover:text-ink">
              Log In
            </a>
            <a
              href="#signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-thread to-thread-2 px-5 py-2.5 text-[0.875rem] font-medium text-white"
            >
              Sign Up Free
              <ArrowRight size={15} />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}