/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  ATHENA — THIS IS YOUR FILE. Design the whole company / About page here.   │
 * │                                                                            │
 * │  This renders on /results, the page a visitor sees right AFTER they finish │
 * │  the questionnaire, while a 15-second countdown runs and then Greece calls │
 * │  them. Put everything the visitor should read here: who Anthony is, the     │
 * │  NXG Life Group story, services, testimonials, trust badges, disclosures.  │
 * │                                                                            │
 * │  You do NOT need to touch anything else. The quiz, contact capture, the    │
 * │  countdown banner, and the Greece call are all handled for you. Just build │
 * │  this component. Use any styling approach you like (the existing design    │
 * │  tokens live in src/styles/global.css, or bring your own).                 │
 * │                                                                            │
 * │  Full guide: docs/athena-integration.md                                    │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import { siteConfig } from "@/site/siteConfig";

export function AboutContent() {
  return (
    <main id="main" className="section container" style={{ maxWidth: 920 }}>
      {/* ===== REPLACE EVERYTHING BELOW WITH THE REAL NXG LIFE GROUP PAGE ===== */}

      <p className="eyebrow">California · {siteConfig.companyName}</p>
      <h1>Meet Anthony &amp; NXG Life Group</h1>
      <p className="lead" style={{ maxWidth: "60ch" }}>
        {siteConfig.tagline}
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>About Anthony</h2>
        <p style={{ color: "var(--muted)", maxWidth: "68ch" }}>
          [Athena: Anthony's story, credentials, and why families and business owners trust him. Build the
          trust-and-confidence content that used to live on the old landing page here.]
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>What we help with</h2>
        <ul style={{ color: "var(--muted)", paddingLeft: "1.2rem" }}>
          <li>Life insurance — term &amp; permanent</li>
          <li>Retirement income &amp; annuities</li>
          <li>Tax-aware strategies</li>
          <li>Infinite Banking / legacy planning</li>
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>What clients say</h2>
        <p style={{ color: "var(--muted)" }}>[Athena: testimonials / social proof.]</p>
      </section>

      <p className="footer-note" style={{ marginTop: "2rem" }}>
        Educational only — not financial, legal, or tax advice. Insurance and annuity products involve fees,
        limitations, and surrender periods. [Athena: keep a compliance/disclosures block here.]
      </p>

      {/* ===== END REPLACE ===== */}
    </main>
  );
}
