import React, { useEffect, useRef, useState } from "react";
import "./Features.css";

/* ---- small inline icons (kept local so this file drops in standalone) --- */
const IconStitch = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="19" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="5" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="19" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.7 6.7L10 10M17.3 6.7L14 10M6.7 17.3L10 14M17.3 17.3L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconFingerprint = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 2 .3 3.6.8 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 3.5c4.7 0 8.5 3.8 8.5 8.5 0 1.6-.2 3-.5 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M8 20c-1-1.8-1.6-3.6-1.8-5.6M16 20c1-1.8 1.6-3.6 1.8-5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 7.2a4.8 4.8 0 0 0-4.8 4.8c0 2.8.8 5 2 6.8M12 7.2a4.8 4.8 0 0 1 4.8 4.8c0 1.4-.2 2.6-.6 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconTimeline = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="7" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="13" cy="12" r="1.8" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="19" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IconDropOff = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 6h9M11 11h6M11 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4 6h4M4 11h4M4 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18 14.5l2.2 2.2L18 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChurn = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 13.5h3.2l2-4.5 3 8 2.4-6 1.8 3.7H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IconReports = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 15v-3M12 15V9M16 15v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4.5" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="9" y="3" width="6" height="3" rx="1" fill="currentColor" />
    <path d="M9 11h6M9 14.5h6M9 18h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ---- useCountUp: animates a number from 0 -> target once `active` is true --- */
function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active || typeof target !== "number") return;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * ease(progress));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, target, duration]);

  return value;
}

/* ---- StatBadge: the small "1B+ / Registered professionals" boxes --- */
function StatBadge({ value, decimals = 0, prefix = "", suffix = "", label, active, delay = 0 }) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0, active, 1300);
  const display = isNumeric ? animated.toFixed(decimals) : value;

  return (
    <div className="nx-stat" style={{ transitionDelay: `${delay}ms` }}>
      <span className="nx-stat__icon"><IconClipboard /></span>
      <div>
        <div className="nx-stat__value">
          {prefix}
          {display}
          {suffix}
        </div>
        <div className="nx-stat__label">{label}</div>
      </div>
    </div>
  );
}

/* ---- BarRow: one animated horizontal bar --- */
function BarRow({ label, sublabel, target, active, delay = 0 }) {
  const animated = useCountUp(target, active, 1400);

  return (
    <div
      className="nx-bar-row"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="nx-bar-row__meta">
        <span className="nx-bar-row__label">{label}</span>
        <span className="nx-bar-row__sublabel">{sublabel}</span>
      </div>

      <div className="nx-bar-track">
        <div
          className="nx-bar-fill"
          style={{
            width: `${animated}%`,
            transitionDelay: `${delay + 80}ms`,
          }}
        >
          <span className="nx-bar-fill__value">
            {Math.round(animated)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- FEATURE_ROWS: your 6 features, adapted into this stat-card format --- */
const FEATURE_ROWS = [
  {
    id: "stitching",
    accent: "orange",
    icon: <IconStitch />,
    badge: "Journeys",
    titleParts: ["Stitch every ", { text: "channel", hl: true }, " into one journey"],
    description:
      "Connect customer interactions from websites, mobile apps, call centers, and physical locations into one continuous journey — no more fragmented, disconnected records.",
    stats: [
      { value: 4, suffix: "+", label: "Channels unified" },
      { value: 100, suffix: "%", label: "Session coverage" },
    ],
    bars: [
      { label: "Website", sublabel: "Page views & clicks stitched", target: 96 },
      { label: "Mobile app", sublabel: "In-app events stitched", target: 91 },
      { label: "Call center", sublabel: "Call logs stitched", target: 78 },
      { label: "In-store", sublabel: "POS visits stitched", target: 64 },
    ],
  },
  {
    id: "identity",
    accent: "teal",
    icon: <IconFingerprint />,
    badge: "Identity",
    titleParts: ["Know it's the ", { text: "same customer", hl: true }, " every time"],
    description:
      "Match interactions belonging to the same customer across different channels, even when identifiers vary — emails, device IDs, and session tokens are quietly reconciled behind the scenes.",
    stats: [
      { value: 99.2, decimals: 1, suffix: "%", label: "Match accuracy" },
      { value: 3.4, decimals: 1, suffix: "M", label: "Identities resolved" },
    ],
    bars: [
      { label: "Email match", sublabel: "Deterministic matching", target: 95 },
      { label: "Device fingerprint", sublabel: "Cross-device linking", target: 88 },
      { label: "Phone match", sublabel: "Verified contact records", target: 76 },
      { label: "Probabilistic match", sublabel: "Behavioral signals", target: 62 },
    ],
  },
  {
    id: "timeline",
    accent: "orange",
    icon: <IconTimeline />,
    badge: "Timeline",
    titleParts: ["See the ", { text: "full story", hl: true }, ", in order"],
    description:
      "View every interaction in chronological order, giving teams complete context of what happened before and after each event — no more piecing together fragments across tools.",
    stats: [
      { value: 1, label: "Single unified view" },
      { value: 12, suffix: "+", label: "Event types tracked" },
    ],
    bars: [
      { label: "Website events", sublabel: "Visits, clicks, forms", target: 94 },
      { label: "Support tickets", sublabel: "Conversations & replies", target: 87 },
      { label: "Purchases", sublabel: "Orders & renewals", target: 100 },
      { label: "App events", sublabel: "Feature usage", target: 83 },
    ],
  },
  {
    id: "dropoff",
    accent: "teal",
    icon: <IconDropOff />,
    badge: "Drop-off",
    titleParts: ["Find exactly ", { text: "where customers stall", hl: true }],
    description:
      "Identify where customers abandon, get stuck, or stop progressing through their journey — pinpointed to the exact step, not just the funnel stage.",
    stats: [
      { value: 38, suffix: "%", label: "Avg. drop-off surfaced" },
      { value: 2, prefix: "<", suffix: "min", label: "Detection time" },
    ],
    bars: [
      { label: "Checkout", sublabel: "Cart to payment", target: 42 },
      { label: "Onboarding", sublabel: "First-run setup", target: 35 },
      { label: "Signup form", sublabel: "Multi-step forms", target: 28 },
      { label: "Trial to paid", sublabel: "Conversion step", target: 51 },
    ],
  },
  {
    id: "churn",
    accent: "orange",
    icon: <IconChurn />,
    badge: "Churn",
    titleParts: ["Catch ", { text: "churn signals", hl: true }, " before they escalate"],
    description:
      "Detect behavioral patterns such as repeated failures, unresolved complaints, and declining engagement that can indicate potential churn risk — early enough to act.",
    stats: [
      { value: 85, suffix: "%", label: "Signal accuracy" },
      { value: 14, suffix: " days", label: "Avg. early warning" },
    ],
    bars: [
      { label: "Repeated failures", sublabel: "Same error, multiple tries", target: 73 },
      { label: "Unresolved complaints", sublabel: "Open support threads", target: 68 },
      { label: "Declining usage", sublabel: "Falling engagement", target: 80 },
      { label: "Support escalations", sublabel: "Tier-2+ handoffs", target: 55 },
    ],
  },
  {
    id: "reports",
    accent: "teal",
    icon: <IconReports />,
    badge: "Reports",
    titleParts: ["Turn journeys into ", { text: "answers", hl: true }],
    description:
      "Generate clear reports that help teams understand what happened, where problems occurred, and which journeys need attention — ready to share, not just to read.",
    stats: [
      { value: 20, suffix: "+", label: "Report templates" },
      { value: "Live", label: "Data refresh" },
    ],
    bars: [
      { label: "Journey reports", sublabel: "End-to-end summaries", target: 95 },
      { label: "Churn reports", sublabel: "Risk cohorts", target: 88 },
      { label: "Drop-off reports", sublabel: "Step-by-step loss", target: 91 },
      { label: "Custom reports", sublabel: "Built by your team", target: 77 },
    ],
  },
];

/* ---- one alternating row --- */
function FeatureRow({ feature, index }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const reversed = index % 2 === 1;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`nx-showcase-row ${reversed ? "nx-showcase-row--reversed" : ""} ${
        active ? "nx-showcase-row--active" : ""
      } nx-showcase-row--${feature.accent}`}
    >
      <div className="nx-showcase-row__text">
        <span className="nx-showcase-badge">
          <span className="nx-showcase-badge__icon">{feature.icon}</span>
          {feature.badge}
        </span>

        <h3 className="nx-showcase-row__title">
          {feature.titleParts.map((part, i) =>
            typeof part === "string" ? (
              <React.Fragment key={i}>{part}</React.Fragment>
            ) : (
              <span className="nx-showcase-row__highlight" key={i}>
                {part.text}
              </span>
            )
          )}
        </h3>

        <p className="nx-showcase-row__desc">{feature.description}</p>
      </div>

      <div className="nx-showcase-row__card">
        <div className="nx-showcase-card">
          <div className="nx-showcase-card__stats">
            {feature.stats.map((s, i) => (
              <StatBadge key={i} {...s} active={active} delay={i * 120} />
            ))}
          </div>

          <div className="nx-showcase-card__bars">
            {feature.bars.map((b, i) => (
              <BarRow key={i} {...b} active={active} delay={i * 130} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- exported section --- */
export default function FeatureShowcase() {
  return (
    <section className="nx-showcase" id="feature-showcase">
      <div className="nx-showcase__header">
        <span className="nx-eyebrow">How it works</span>
        <h2 className="nx-showcase__title">
          Six capabilities. <em>One</em> unified view.
        </h2>
        <p className="nx-showcase__subtitle">
          Scroll through what each part of Breeze actually does &mdash; the
          numbers below fill in live as you go.
        </p>
      </div>

      <div className="nx-showcase__rows">
        {FEATURE_ROWS.map((feature, i) => (
          <FeatureRow feature={feature} index={i} key={feature.id} />
        ))}
      </div>
    </section>
  );
}
