import { Link } from "react-router-dom";
import { BookStrategyButton } from "@/components/BookStrategyButton";

export function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main">
        <section className="section container">
          <div className="grid-2" style={{ alignItems: "center", gap: "2rem" }}>
            <div>
              <p className="eyebrow">California · Financial clarity first</p>
              <h1>Understand your next financial move before you commit capital</h1>
              <p className="lead">
                Indexed universal life, annuities, whole life, term, retirement income, tax-aware concepts, and cash-flow
                strategies — framed as education and suitability review, not hype.
              </p>
              <div className="stack" style={{ marginTop: "1.5rem" }}>
                <Link className="btn btn--primary btn--call" to="/quiz" state={{ reset: true }}>
                  Start the 2-minute check-in → get an instant callback
                </Link>
                <div className="stack stack--row-md">
                  <BookStrategyButton />
                </div>
                <p className="footer-note" style={{ marginTop: "0.5rem" }}>
                  Finish the quick check-in, drop your number, and a licensed professional calls you back — usually
                  within a minute. Prefer to schedule instead? Booking stays available.
                </p>
              </div>
            </div>
            <div className="card stack">
              <p className="eyebrow">Why we call you back</p>
              <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                Warm Instagram and Meta traffic converts best when a real conversation clarifies facts fast —
                underwriting, timelines, and tradeoffs don’t fit in a generic form.
              </p>
              <ul style={{ margin: "1rem 0 0", paddingLeft: "1.2rem", color: "var(--muted)" }}>
                <li>No hypothetical returns pitched here — we discuss mechanics and fit.</li>
                <li>The quiz pre-frames your intent so the call is about your facts, not a script.</li>
                <li>If we’re not the right fit, we’ll say so.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="video" className="section section--tight container">
          <h2>Inside how we think about strategy</h2>
          <p style={{ color: "var(--muted)", maxWidth: "62ch" }}>
            Drop your founder or authority clip here (upload to YouTube/Vimeo unlisted and paste URL). Video builds trust
            before the quiz — keep it under 90 seconds for paid traffic efficiency.
          </p>
          <div
            className="card"
            style={{
              aspectRatio: "16/9",
              display: "grid",
              placeItems: "center",
              background: "var(--surface)",
              marginTop: "1rem",
            }}
          >
            <p style={{ color: "var(--muted)", padding: "2rem", textAlign: "center", margin: 0 }}>
              Embed placeholder — replace with{" "}
              <code style={{ color: "var(--accent)" }}>&lt;iframe&gt;</code> or video component when URL is ready.
            </p>
          </div>
        </section>

        <section id="trust" className="section container">
          <h2>Built for families and owners navigating complexity</h2>
          <div className="trust-row">
            <span>✓ Life insurance · term &amp; permanent concepts</span>
            <span>✓ Annuities · suitability &amp; income mechanics</span>
            <span>✓ Retirement income sequencing ideas</span>
            <span>✓ Tax-aware discussions (general — not individual tax advice)</span>
            <span>✓ Infinite banking / cash value banking concepts</span>
          </div>
          <p className="footer-note" style={{ marginTop: "1rem" }}>
            NXG Life Group educates and facilitates introductions to licensed carriers / professionals as appropriate.
            Product availability varies by state and underwriting.
          </p>
        </section>

        <section id="proof" className="section container">
          <h2>What clients say</h2>
          <div className="grid-2">
            <blockquote className="card" style={{ margin: 0 }}>
              <p style={{ color: "var(--muted)", marginBottom: "0.75rem" }}>
                “Finally someone mapped tradeoffs without promising the market.”
              </p>
              <footer style={{ fontSize: "0.85rem", color: "var(--accent)" }}>— Replace with verifiable testimonial</footer>
            </blockquote>
            <blockquote className="card" style={{ margin: 0 }}>
              <p style={{ color: "var(--muted)", marginBottom: "0.75rem" }}>
                “The quiz forced clarity — the call was about my facts, not a pitch deck.”
              </p>
              <footer style={{ fontSize: "0.85rem", color: "var(--accent)" }}>— Replace with verifiable testimonial</footer>
            </blockquote>
          </div>
        </section>

        <section id="faq" className="section container">
          <h2>FAQ</h2>
          <div className="stack" style={{ gap: "1.25rem", maxWidth: "720px" }}>
            <div>
              <h3>Is this financial advice?</h3>
              <p>
                Content and quizzes are educational. Personalized guidance happens after suitability and licensing
                conversations — not on this page.
              </p>
            </div>
            <div>
              <h3>Will you promise returns or tax outcomes?</h3>
              <p>No. Insurance and annuity performance depends on product design, funding, and issuer factors — not guarantees.</p>
            </div>
            <div>
              <h3>Why phone first?</h3>
              <p>
                Nuanced facts determine fit. Calls reduce back-and-forth and protect you from unsuitable shortcuts.
              </p>
            </div>
            <div>
              <h3>What if I don’t call today?</h3>
              <p>
                Save your recap via the form on the results page — optional SMS/email if you consent — we’ll follow up
                respectfully.
              </p>
            </div>
          </div>
        </section>

        <section id="compliance" className="section container">
          <h2>Important disclosures</h2>
          <p className="footer-note">
            Securities offered through appropriately licensed individuals only where permitted. Insurance products described
            involve fees, limitations, and surrender periods. For fixed annuities, guarantees are backed by the issuing
            insurer’s claims-paying ability — not bank FDIC insurance. This site does not provide legal or tax advice;
            consult qualified professionals for guidance specific to your circumstances.
          </p>
          <p className="footer-note">
            <strong style={{ color: "var(--text)" }}>Privacy:</strong> We collect contact details only when you submit
            them, alongside quiz responses for segmentation. California residents may have additional rights under the
            CPRA — link your full privacy policy from nxglifegroup.com here when published.
          </p>
        </section>

        <footer className="section section--tight container" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid-2">
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.35rem" }}>NXG Life Group</p>
              <p className="footer-note">
                Serving California families &amp; business owners · Warm-lead funnel — not cold solicitation by default.
              </p>
            </div>
            <div className="stack" style={{ alignItems: "flex-start" }}>
              <Link className="btn btn--primary" to="/quiz" state={{ reset: true }}>
                Take the check-in &amp; get a callback
              </Link>
              <a className="footer-note" href="https://nxglifegroup.com" target="_blank" rel="noopener noreferrer">
                nxglifegroup.com
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
