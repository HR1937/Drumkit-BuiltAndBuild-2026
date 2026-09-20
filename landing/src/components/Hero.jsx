import {
  Globe,
  Smartphone,
  Phone,
  Store,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NODES = [
  {
    key: "website",
    label: "Website",
    Icon: Globe,
    x: 70,
    y: 78,
    path: "M70,78 Q140,112 200,205",
    delay: "0.6s",
  },
  {
    key: "app",
    label: "Mobile App",
    Icon: Smartphone,
    x: 330,
    y: 70,
    path: "M330,70 Q262,110 200,205",
    delay: "0.78s",
  },
  {
    key: "call",
    label: "Call Center",
    Icon: Phone,
    x: 60,
    y: 332,
    path: "M60,332 Q130,292 200,205",
    delay: "0.96s",
  },
  {
    key: "store",
    label: "In-Store",
    Icon: Store,
    x: 340,
    y: 330,
    path: "M340,330 Q270,290 200,205",
    delay: "1.14s",
  },
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
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-thread/10 blur-[70px]" />

      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="threadGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#FF5A36" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>

          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
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

        {/* Subtle outer connection dots */}
        {NODES.map(({ key, x, y }) => (
          <circle
            key={`outer-${key}`}
            cx={x}
            cy={y}
            r="4"
            fill="#22C55E"
            opacity="0.25"
          />
        ))}

        {/* Animated data particles */}
        {NODES.map(({ key, path, delay }) => (
          <circle
            key={`dot-${key}`}
            r="4"
            fill="#FF5A36"
            filter="url(#nodeGlow)"
          >
            <animateMotion
              dur="2.8s"
              begin={`${parseFloat(delay) + 1.2}s`}
              repeatCount="indefinite"
              path={path}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="2.8s"
              begin={`${parseFloat(delay) + 1.2}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Center pulse rings */}
        <circle
          cx="200"
          cy="205"
          r="66"
          fill="none"
          stroke="#FF5A36"
          strokeWidth="1"
          opacity="0.12"
        />

        <circle
          cx="200"
          cy="205"
          r="82"
          fill="none"
          stroke="#FF5A36"
          strokeWidth="1"
          strokeDasharray="4 10"
          opacity="0.1"
          style={{
            animation: "spin-slow 18s linear infinite",
            transformOrigin: "200px 205px",
          }}
        />
      </svg>

      {/* Source nodes */}
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
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-thread/0 blur-md transition-all duration-300 group-hover:bg-thread/15" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/8 bg-surface text-muted shadow-[0_6px_20px_-6px_rgba(18,22,43,0.15)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-thread/50 group-hover:text-thread group-hover:shadow-[0_10px_24px_-6px_rgba(255,90,54,0.3)]">
              <Icon size={20} strokeWidth={1.75} />
            </div>
          </div>

          <span className="whitespace-nowrap text-[0.7rem] font-medium text-muted transition-colors duration-300 group-hover:text-ink">
            {label}
          </span>
        </div>
      ))}

      {/* Center Breeze */}
      <div
        className="absolute left-1/2 top-[51.25%] z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          animation:
            "reveal-down 0.7s cubic-bezier(.16,.84,.44,1) 0.5s both",
        }}
      >
        {/* Animated glow */}
        <div className="absolute -inset-7 rounded-full bg-thread/15 blur-2xl [animation:pulse-ring_3s_ease-in-out_infinite]" />

        {/* Rotating outer ring */}
        <div
          className="absolute -inset-3 rounded-full border border-thread/15 border-dashed"
          style={{
            animation: "spin-slow 12s linear infinite",
          }}
        />

        <div className="relative flex h-24 w-24 flex-col items-center justify-center gap-0.5 rounded-full border border-thread/30 bg-surface text-center shadow-[0_12px_36px_-8px_rgba(255,90,54,0.4)]">
          <div className="absolute inset-1 rounded-full border border-thread/10" />

          <span className="relative font-display text-[0.95rem] italic text-ink">
            Breeze
          </span>

          <span className="relative text-[0.55rem] uppercase tracking-[0.18em] text-teal">
            unified
          </span>

          <span className="relative mt-1 text-[0.48rem] font-semibold uppercase tracking-wider text-thread">
            stitching
          </span>
        </div>
      </div>

      {/* Identity resolved badge */}
      <div
        className="absolute left-1/2 top-[51.25%] z-30 mt-[62px] -translate-x-1/2"
        style={{
          animation:
            "reveal-down 0.6s cubic-bezier(.16,.84,.44,1) 1.35s both",
        }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/8 bg-surface/90 px-3 py-1.5 text-[0.62rem] font-medium text-muted shadow-md backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-teal [animation:pulse-ring_2s_ease-in-out_infinite]" />
          Identity resolved
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate(); const [demoState, setDemoState] = useState("ready");
  const enterDemo = async () => { setDemoState("loading"); try { const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8787"}/api/auth/demo`, { method: "POST", credentials: "include" }); if (!response.ok) throw new Error(); navigate("/app"); } catch { setDemoState("error"); } };
  return (
    <section className="relative overflow-hidden bg-paper pb-24 pt-36 lg:pb-32 lg:pt-44">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-thread/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
        {/* LEFT CONTENT */}
        <div className="max-w-xl">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-thread/15 bg-thread/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-thread"
            style={{
              animation:
                "reveal-left 0.7s cubic-bezier(.16,.84,.44,1) 0s both",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-thread [animation:pulse-ring_2s_ease-in-out_infinite]" />
            Cross-Channel Journey Intelligence
          </div>

          <h1
            className="font-display text-[2.5rem] leading-[1.08] tracking-tight text-ink sm:text-[3rem] lg:text-[3.7rem]"
            style={{
              animation:
                "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.08s both",
            }}
          >
            Every interaction.
            <br />
            <span className="text-thread">One connected journey.</span>
          </h1>

          <p
            className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted"
            style={{
              animation:
                "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.18s both",
            }}
          >
            Breeze connects fragmented interactions from websites, mobile
            apps, call centers, and physical locations into one unified
            customer journey, helping you uncover drop-offs, escalations,
            repeated contacts, unresolved issues, and potential churn
            signals.
          </p>

          {/* CTA */}
          <div
            className="mt-9 flex flex-wrap items-center gap-4"
            style={{
              animation:
                "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.3s both",
            }}
          >
            <button
              type="button"
              onClick={enterDemo}
              disabled={demoState === "loading"}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-thread to-thread-2 px-7 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_10px_30px_-8px_rgba(255,90,54,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-6px_rgba(255,90,54,0.55)]"
            >
              <span
                className="pointer-events-none absolute inset-0 hidden w-1/3 bg-white/35 group-hover:block"
                style={{
                  animation: "shine-sweep 1s ease-in-out",
                }}
              />

              <span className="relative">{demoState === "loading" ? "Opening Demo…" : "Explore Demo Workspace"}</span>

              <ArrowRight
                size={17}
                className="relative transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-[linear-gradient(to_right,var(--color-teal)_50%,transparent_50%)] bg-[length:200%_100%] bg-right px-6 py-3.5 text-[0.95rem] font-medium text-ink transition-all duration-500 ease-out hover:border-teal hover:bg-left hover:text-white"
            >
              <PlayCircle
                size={18}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              See How It Works
            </a>
          </div>
          {demoState === "error" && <p className="mt-3 text-sm text-red-600">The demo workspace is temporarily unavailable.</p>}

          {/* Supporting line */}
          <div
            className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.78rem] text-muted"
            style={{
              animation:
                "reveal-left 0.8s cubic-bezier(.16,.84,.44,1) 0.42s both",
            }}
          >
            <span>Website</span>
            <span className="text-thread">•</span>
            <span>Mobile</span>
            <span className="text-thread">•</span>
            <span>Call Center</span>
            <span className="text-thread">•</span>
            <span>Physical Locations</span>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="relative">
          <JourneyVisual />
        </div>
      </div>
    </section>
  );
}
