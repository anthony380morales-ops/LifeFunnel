/**
 * NXG Life Group — company / About page (rendered on /results, after the quiz).
 * The visitor reads this while Greece silently calls them.
 *
 * Assets: drop `public/anthony.jpg` (waist-up photo) — the portrait fills in
 * automatically; until then an elegant gradient frame shows. A gold shield
 * emblem is drawn inline as the brand mark.
 */
import { type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/site/siteConfig";
import { useScrollReveal } from "@/site/useScrollReveal";
import "@/site/site.css";

export function AboutContent() {
  useScrollReveal();
  return (
    <div className="nxg">
      {/* ---------- Nav ---------- */}
      <nav className="nxg-nav">
        <a className="nxg-brand" href="#top">
          <Shield size={30} /> {siteConfig.companyName}
        </a>
        <div className="nxg-navlinks">
          <a className="nxg-hide-sm" href="#services">Services</a>
          <a className="nxg-hide-sm" href="#about">About</a>
          <a className="nxg-hide-sm" href="#approach">Approach</a>
          <Link className="nxg-login" to="/dashboard">Client Login</Link>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <header id="top" className="nxg-wrap nxg-hero">
        <div>
          <p className="nxg-eyebrow nxg-fade nxg-d1">California · {siteConfig.companyName}</p>
          <h1 className="nxg-fade nxg-d1">
            Turning Uncertainty<br />
            <span className="nxg-gold">Into Certainty</span>
          </h1>
          <p className="nxg-sub nxg-fade nxg-d2">
            Because it's not just life insurance — it's assurance. We help California families and
            business owners protect what matters and plan retirement with clarity, never pressure.
          </p>
          <div className="nxg-fade nxg-d3">
            <span className="nxg-reassure">
              <span className="nxg-pulse" aria-hidden /> Sit tight — a licensed professional is connecting with you personally.
            </span>
          </div>
          <div className="nxg-chips nxg-fade nxg-d4">
            <span className="nxg-chip">Life insurance · term &amp; permanent</span>
            <span className="nxg-chip">Retirement income &amp; annuities</span>
            <span className="nxg-chip">Infinite Banking / legacy</span>
            <span className="nxg-chip">Tax-aware strategies</span>
          </div>
        </div>
        <div className="nxg-emblem nxg-fade nxg-d2" aria-hidden>
          <Shield size={340} />
        </div>
      </header>

      {/* ---------- Services ---------- */}
      <section id="services" className="nxg-section nxg-wrap">
        <div className="nxg-center nxg-reveal">
          <p className="nxg-eyebrow">What we help you navigate</p>
          <h2>Clear strategies for every stage</h2>
          <p className="nxg-kicker">
            No hypotheticals, no jargon — just two or three clean options that fit your life, explained honestly.
          </p>
        </div>
        <div className="nxg-cards">
          <Card index={0} icon={<IcoShield />} title="Protection">
            Term, whole, IUL, and final-expense coverage designed around your family's real needs — so if
            life happens, they keep their choices.
          </Card>
          <Card index={1} icon={<IcoGrowth />} title="Retirement Income">
            Annuities, rollovers, and income strategies built for certainty — whether the market soars,
            stalls, or slides.
          </Card>
          <Card index={2} icon={<IcoBank />} title="Infinite Banking & Legacy">
            Become your own bank: controlled liquidity, real tax advantages, and a legacy that doesn't ride
            Wall Street's roller coaster.
          </Card>
          <Card index={3} icon={<IcoTax />} title="Tax-Aware Planning">
            Keep more of what you earn with strategies coordinated around your bigger financial picture
            (general guidance — not individual tax advice).
          </Card>
        </div>
      </section>

      {/* ---------- About Anthony ---------- */}
      <section id="about" className="nxg-section nxg-wrap">
        <div className="nxg-about nxg-reveal">
          <div
            className="nxg-portrait"
            style={{ ["--img"]: "url('/anthony.jpg')" } as CSSProperties}
          >
            <div className="nxg-portrait-cap">
              <strong>Anthony Morales</strong>
              <span>Life Insurance Agent · California</span>
            </div>
          </div>
          <div>
            <p className="nxg-eyebrow">Meet your advisor</p>
            <h2>Hi, I'm Anthony Morales.</h2>
            <p>
              I'm a licensed life-insurance agent serving California families and business owners. My whole
              approach is clarity over complexity — I'll show you a couple of clean options that actually fit
              your life, walk through the tradeoffs honestly, and never pressure you.
            </p>
            <p>
              "Turning uncertainty into certainty" isn't just a line to me — it's how every conversation
              starts. You should understand exactly what you have and why, before you ever commit a dollar.
            </p>
            <ul className="nxg-creds">
              <li><span>Name</span> <strong>Anthony Morales</strong></li>
              <li><span>License #</span> <strong>4490102</strong></li>
              <li><span>Occupation</span> <strong>Life Insurance Agent</strong></li>
              <li><span>Serving</span> <strong>California</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Approach ---------- */}
      <section id="approach" className="nxg-section nxg-wrap">
        <div className="nxg-center nxg-reveal">
          <p className="nxg-eyebrow">Why families choose NXG</p>
          <h2>A different kind of conversation</h2>
        </div>
        <div className="nxg-cards" style={{ marginTop: "2.5rem" }}>
          <Card index={0} icon={<IcoSpark />} title="Clarity over complexity">
            You'll leave every call understanding your options in plain language — no hypothetical returns,
            no fine-print surprises.
          </Card>
          <Card index={1} icon={<IcoHeart />} title="Education, never pressure">
            We explain mechanics and fit. If we're not the right match for you, we'll say so.
          </Card>
          <Card index={2} icon={<IcoBadge />} title="Licensed & compliant">
            California-licensed guidance (Lic. #4490102), coordinated with the professionals already on your team.
          </Card>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="nxg-section nxg-wrap">
        <div className="nxg-center nxg-reveal">
          <p className="nxg-eyebrow">In their words</p>
          <h2>What clients say</h2>
        </div>
        <div className="nxg-quotes">
          <figure className="nxg-quote nxg-reveal" style={{ ["--i"]: 0 } as CSSProperties}>
            <p>"Anthony mapped out the tradeoffs without promising the market. For the first time, I actually understood what I was buying."</p>
            <footer>— Verified client testimonial (replace)</footer>
          </figure>
          <figure className="nxg-quote nxg-reveal" style={{ ["--i"]: 1 } as CSSProperties}>
            <p>"No pressure, no jargon. Ten minutes on the phone and I finally had a plan that fit my family."</p>
            <footer>— Verified client testimonial (replace)</footer>
          </figure>
          <figure className="nxg-quote nxg-reveal" style={{ ["--i"]: 2 } as CSSProperties}>
            <p>"He treated my business like his own — the liquidity strategy alone was worth the call."</p>
            <footer>— Verified client testimonial (replace)</footer>
          </figure>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="nxg-footer nxg-wrap">
        <div className="nxg-footer-top">
          <div>
            <a className="nxg-brand" href="#top"><Shield size={28} /> {siteConfig.companyName}</a>
            <p className="footer-note" style={{ marginTop: "0.75rem" }}>
              Serving California families &amp; business owners.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <small>NXG Life Group © 2026</small><br />
            <small>CA License #4490102</small><br />
            <Link to="/dashboard" style={{ fontSize: "0.85rem" }}>Client Login</Link>
          </div>
        </div>
        <p className="nxg-disclaimer">
          Educational information only — not financial, legal, or tax advice. Insurance and annuity products
          (including IUL and whole life) involve fees, limitations, and surrender periods; cash value is not
          guaranteed. Fixed-annuity guarantees are backed by the issuing insurer's claims-paying ability, not
          FDIC insurance. Product availability varies by state and underwriting. California residents may have
          additional privacy rights; consult qualified professionals for advice specific to your situation.
        </p>
      </footer>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Card({ icon, title, index = 0, children }: { icon: ReactNode; title: string; index?: number; children: ReactNode }) {
  return (
    <article className="nxg-card nxg-reveal" style={{ ["--i"]: index } as CSSProperties}>
      <div className="nxg-ico">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function Shield({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NXG shield">
      <defs>
        <linearGradient id="nxgGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6da7b" />
          <stop offset="0.45" stopColor="#d4af37" />
          <stop offset="1" stopColor="#9c7719" />
        </linearGradient>
      </defs>
      <path d="M32 2 60 12v24c0 18-12 28-28 34C16 64 4 54 4 36V12L32 2Z" stroke="url(#nxgGold)" strokeWidth="2.5" fill="rgba(201,162,39,0.06)" />
      <path d="M20 46V26l12 12 12-12v20" stroke="url(#nxgGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const ico = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IcoShield() { return (<svg {...ico}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /></svg>); }
function IcoGrowth() { return (<svg {...ico}><path d="M4 19h16" /><path d="M4 15l4-5 4 3 6-8" /><path d="M18 5h2v2" /></svg>); }
function IcoBank() { return (<svg {...ico}><path d="M3 9l9-5 9 5" /><path d="M5 9v9M9 9v9M15 9v9M19 9v9" /><path d="M3 20h18" /></svg>); }
function IcoTax() { return (<svg {...ico}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>); }
function IcoSpark() { return (<svg {...ico}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>); }
function IcoHeart() { return (<svg {...ico}><path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.6 12 20 12 20z" /></svg>); }
function IcoBadge() { return (<svg {...ico}><circle cx="12" cy="10" r="6" /><path d="M9 15l-1 6 4-2 4 2-1-6" /></svg>); }
