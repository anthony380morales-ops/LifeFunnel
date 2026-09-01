import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { isQuizComplete } from "@/lib/quizLogic";
import { toE164 } from "@/lib/phone";
import { trackEvent } from "@/lib/analytics";

const fieldStyle = {
  minHeight: "var(--tap-min)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "rgba(15,23,42,0.65)",
  color: "var(--text)",
  padding: "0 1rem",
  fontSize: "1rem",
} as const;

/**
 * Contact capture — the final part of the questionnaire. Collects name, email,
 * phone, and call consent, stores them in context, then sends the visitor to
 * /results where the countdown + Greece call happen.
 */
export function DetailsPage() {
  const navigate = useNavigate();
  const { answers, setContact } = useFunnel();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent_call, setConsentCall] = useState(false);
  const [consent_email, setConsentEmail] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Can't capture details without a completed quiz.
  if (!isQuizComplete(answers)) return <Navigate to="/" replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!first_name.trim()) {
      setErrorMsg("Please enter your first name.");
      return;
    }
    if (!toE164(phone)) {
      setErrorMsg("Enter a valid mobile number so Anthony's team can call you.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Enter your email so we can send your appointment confirmation.");
      return;
    }
    if (!consent_call) {
      setErrorMsg("Please check the box authorizing us to call you at this number.");
      return;
    }

    setContact({
      first_name: first_name.trim(),
      last_name: last_name.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      consent_call,
      consent_email,
    });
    trackEvent("lead_capture_submit", { step: "details" });
    navigate("/results", { replace: true });
  }

  return (
    <section className="section container" style={{ maxWidth: 560 }}>
      <p className="eyebrow">Last step</p>
      <h1>Where should Anthony's team reach you?</h1>
      <p className="lead">
        Add your details and we'll call you in about a minute to talk through what you're looking for — no waiting on
        hold.
      </p>

      <form className="card stack" onSubmit={onSubmit} noValidate style={{ marginTop: "1.5rem" }}>
        <div className="grid-2">
          <label className="stack" style={{ gap: "0.35rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>First name</span>
            <input className="input" style={fieldStyle} value={first_name} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
          </label>
          <label className="stack" style={{ gap: "0.35rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Last name</span>
            <input className="input" style={fieldStyle} value={last_name} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
          </label>
        </div>

        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Mobile phone <span style={{ color: "var(--accent)" }}>(required — the number we call)</span>
          </span>
          <input className="input" style={fieldStyle} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" required />
        </label>

        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Email <span style={{ color: "var(--accent)" }}>(required — for your appointment confirmation)</span>
          </span>
          <input className="input" style={fieldStyle} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </label>

        <label className="stack" style={{ gap: "0.35rem", alignItems: "flex-start", flexDirection: "row" }}>
          <input type="checkbox" checked={consent_call} onChange={(e) => setConsentCall(e.target.checked)} style={{ width: 22, height: 22, marginTop: 4 }} />
          <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
            I authorize NXG Life Group to contact me at the number provided for a brief consultation call, including
            through an automated or AI-assisted dialing system. Consent isn't a condition of purchase. Calling rates may
            apply. I can ask to stop at any time.
          </span>
        </label>

        <label className="stack" style={{ gap: "0.35rem", alignItems: "flex-start", flexDirection: "row" }}>
          <input type="checkbox" checked={consent_email} onChange={(e) => setConsentEmail(e.target.checked)} style={{ width: 22, height: 22, marginTop: 4 }} />
          <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
            Email me my recap and helpful follow-ups. I can unsubscribe anytime. (Your appointment confirmation is sent
            either way.)
          </span>
        </label>

        {errorMsg ? (
          <p style={{ color: "var(--danger)", margin: 0 }} role="alert">
            {errorMsg}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary btn--call">
          Get my call →
        </button>
        <p className="footer-note" style={{ margin: 0 }}>
          Educational follow-up only — not financial advice. California residents: see our privacy practices.
        </p>
      </form>
    </section>
  );
}
