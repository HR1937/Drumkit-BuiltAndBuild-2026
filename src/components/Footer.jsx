import React from "react";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "How It Works", "Integrations"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["FAQ", "Help Center", "API Docs", "Changelog"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"],
  },
];

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "#", icon: "x" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "GitHub", href: "#", icon: "github" },
];

function SocialIcon({ icon }) {
  if (icon === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.2" cy="8.2" r="1" fill="currentColor" />
        <path d="M8.2 11v5.5M12 11v5.5M12 13.2c0-1.3 1-2.2 2.1-2.2S16 12 16 13.2v3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1.1-2.9-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8 8 0 0 1 4.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.2-2 4-3.9 4.2.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Footer
 * Dark-themed footer: brand + social row, four link columns, bottom bar.
 * Self-contained — styles are embedded below, no separate CSS file needed.
 * Swap `href="#"` placeholders for real routes when ready.
 */
export default function Footer() {
  return (
    <footer className="nx-footer">
      <style>{`
        :root {
          --nx-footer-bg: #101223;
          --nx-orange: #f9781f;
          --nx-amber: #ffb648;
          --nx-orange-gradient: linear-gradient(100deg, var(--nx-orange) 0%, var(--nx-amber) 100%);
          --nx-font-serif: "Times New Roman", Georgia, "Playfair Display", serif;
          --nx-font-sans: "Inter", "Helvetica Neue", Arial, sans-serif;
        }

        .nx-footer {
          background: var(--nx-footer-bg);
          padding: 72px 8vw 32px;
          font-family: var(--nx-font-sans);
          color: rgba(255, 255, 255, 0.68);
        }

        /* ---- brand row ---- */
        .nx-footer__top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 40px;
        }

        .nx-footer__logo {
          position: relative;
          display: inline-block;
          font-family: var(--nx-font-serif);
          font-size: 26px;
          color: #fff;
          margin-bottom: 10px;
        }

        .nx-footer__logo-swirl {
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 46px;
          height: 8px;
          background: var(--nx-orange-gradient);
          border-radius: 999px;
          opacity: 0.9;
        }

        .nx-footer__tagline {
          margin: 0;
          font-size: 14.5px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.5);
          max-width: 320px;
        }

        .nx-footer__socials {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nx-footer__social-link {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.75);
          transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .nx-footer__social-link svg { width: 16px; height: 16px; }

        .nx-footer__social-link:hover {
          color: #fff;
          border-color: transparent;
          background: var(--nx-orange-gradient);
          transform: translateY(-3px);
        }

        /* ---- divider ---- */
        .nx-footer__divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 44px;
        }

        /* ---- columns ---- */
        .nx-footer__columns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-bottom: 56px;
        }

        @media (max-width: 820px) {
          .nx-footer__columns { grid-template-columns: repeat(2, 1fr); gap: 40px 24px; }
        }
        @media (max-width: 480px) {
          .nx-footer__columns { grid-template-columns: 1fr; gap: 32px; }
        }

        .nx-footer__col h4 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .nx-footer__col ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nx-footer__col a {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          transition: color 0.25s ease;
        }

        .nx-footer__col a:hover {
          color: var(--nx-amber);
        }

        /* ---- bottom bar ---- */
        .nx-footer__bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }

        .nx-footer__bar-sub {
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="nx-footer__top">
        <div className="nx-footer__brand">
          <div className="nx-footer__logo">
            Nexjour
            <span className="nx-footer__logo-swirl" aria-hidden="true" />
          </div>
          <p className="nx-footer__tagline">
            One customer. Every interaction. One complete journey.
          </p>
        </div>

        <div className="nx-footer__socials">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="nx-footer__social-link"
            >
              <SocialIcon icon={s.icon} />
            </a>
          ))}
        </div>
      </div>

      <div className="nx-footer__divider" />

      <div className="nx-footer__columns">
        {FOOTER_COLUMNS.map((col) => (
          <div className="nx-footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="nx-footer__bar">
        <span>&copy; {new Date().getFullYear()} Nexjour. All rights reserved.</span>
        <span className="nx-footer__bar-sub">
          Made for connected customer journeys.
        </span>
      </div>
    </footer>
  );
}