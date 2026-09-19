import { Globe, Smartphone, Phone, Store, ArrowRight, PlayCircle } from "lucide-react";

const NODES = [
  { key: "website", label: "Website", Icon: Globe, x: 70, y: 78, path: "M70,78 Q140,112 200,205", delay: "0.6s" },
  { key: "app", label: "Mobile App", Icon: Smartphone, x: 330, y: 70, path: "M330,70 Q262,110 200,205", delay: "0.78s" },
  { key: "call", label: "Call Center", Icon: Phone, x: 60, y: 332, path: "M60,332 Q130,292 200,205", delay: "0.96s" },
  { key: "store", label: "In-Store", Icon: Store, x: 340, y: 330, path: "M340,330 Q270,290 200,205", delay: "1.14s" },
];

function JourneyVisual() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[440px]"
      style={{
        animation:
          "reveal-right 0.9s cubic-bezier(.16,.84,.44,1) 0.35s both, float-slow 7s ease-in-out 1.2s infinite",
      }}
    >
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {NODES.map(({ key, path, delay }) => (
          <path
            key={key}
            d={path}
            fill="none"
            stroke="url(#threadGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="340"
            strokeDashoffset="340"
            style={{
              animation: `draw-thread 1.3s cubic-bezier(.65,0,.35,1) ${delay} forwards`,
            }}
          />
        ))}

        {NODES.map(({ key, path, delay }) => (
          <circle key={`dot-${key}`} r="3.5" fill="#0D9488" opacity="0.9">
            <animateMotion
              dur="3.2s"
              begin={`${1.9 + parseFloat(delay)}s`}
              repeatCount="indefinite"
              path={path}
            />
          </circle>
        ))}

        <defs>
          <linearGradient id="threadGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5A36" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>
        </defs>
      </svg>

      {NODES.map(({ key, label, Icon, x, y, delay }) => (
        <div
          key={key}
          className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          style={{
            left: `${(x / 400) * 100}%`,
            top: `${(y / 400) * 100}%`,
            animation: `reveal-down 0.6s cubic-bezier(.16,.84,.44,1) ${delay} both`,
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/8 bg-surface text-muted shadow-[0_6px_20px_-6px_rgba(18,22,43,0.15)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-thread/50 group-hover:text-thread group-hover:shadow-[0_10px_24px_-6px_rgba(255,90,54,0.3)]">
            <Icon size={20} strokeWidth={1.75} />
          </div>
          <span className="text-[0.7rem] font-medium text-muted transition-colors duration-300 group-hover:text-ink">
            {label}
          </span>
        </div>
      ))}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: "50%",
          top: "51.25%",
          animation: "reveal-down 0.6s cubic-bezier(.16,.84,.44,1) 0.5s both",
        }}
      >
        <div className="absolute inset-0 -m-3 rounded-full bg-thread/20 [animation:pulse-ring_3s_ease-in-out_infinite]" />
        <div className="relative flex h-24 w-24 flex-col items-center justify-center gap-0.5 rounded-full border border-thread/30 bg-surface text-center shadow-[0_12px_36px_-8px_rgba(255,90,54,0.4)]">
          <span className="font-display text-[0.95rem] italic text-ink">Nexjour</span>
          <span className="text-[0.55rem] uppercase tracking-wide text-teal">unified</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper pb-24 pt-36 lg:pb-32 lg:pt-44">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-thread/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
        <div className="max-w-xl">
          <h1
            className="font-display text-[2.5rem] leading-[1.12] text-ink sm:text-[3rem] lg:text-[3.4rem]"
            style={{ animation: "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0s both" }}
          >
            One customer.
            <br />
            Every interaction.
            <br />
            One complete journey.
          </h1>

          <p
            className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted"
            style={{ animation: "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.15s both" }}
          >
            Nexjour connects fragmented interactions from websites, mobile
            apps, call centers, and physical locations into one unified
            customer journey, helping you uncover drop-offs, escalations,
            repeated contacts, unresolved issues, and potential churn
            signals.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-4"
            style={{ animation: "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.3s both" }}
          >
            <a
              href="#signup"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-thread to-thread-2 px-7 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_10px_30px_-8px_rgba(255,90,54,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-6px_rgba(255,90,54,0.55)]"
            >
              <span
                className="pointer-events-none absolute inset-0 hidden w-1/3 bg-white/35 group-hover:block"
                style={{ animation: "shine-sweep 1s ease-in-out" }}
              />
              <span className="relative">Start Free Trial</span>
              <ArrowRight
                size={17}
                className="relative transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[linear-gradient(to_right,var(--color-teal)_50%,transparent_50%)] bg-[length:200%_100%] bg-right px-6 py-3.5 text-[0.95rem] font-medium text-ink transition-all duration-500 ease-out hover:bg-left hover:border-teal hover:text-white"
            >
              <PlayCircle
                size={18}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              See How It Works
            </a>
          </div>

          <p
            className="mt-7 text-[0.825rem] text-muted"
            style={{ animation: "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.42s both" }}
          >
            No credit card required, set up your first journey in minutes
          </p>
        </div>

        <div className="relative">
          <JourneyVisual />
        </div>
      </div>
    </section>
  );
}