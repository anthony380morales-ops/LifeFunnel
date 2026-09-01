import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { isQuizComplete } from "@/lib/quizLogic";
import { toE164 } from "@/lib/phone";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/site/siteConfig";
import "@/site/quiz.css";

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
    <div className="nxq">
      <div className="nxq-shell">
        <header className="nxq-top">
          <span className="nxq-brand">
            {siteConfig.logoSrc ? (
              <img className="nxq-logo" src={siteConfig.logoSrc} alt={`${siteConfig.companyName} logo`} />
            ) : null}
            {siteConfig.companyName}
          </span>
          <span className="nxq-step">Last step</span>
        </header>

        <div className="nxq-progress" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
          <div className="nxq-progress-fill" style={{ width: "100%" }} />
        </div>

        <div className="nxq-card">
          <p className="nxq-eyebrow">Almost there</p>
          <h1 className="nxq-title">Where should Anthony's team reach you?</h1>
          <p className="nxq-sub">
            Add your details and we'll call you in about a minute to talk through what you're looking for —
            no waiting on hold.
          </p>

          <form className="nxq-form" onSubmit={onSubmit} noValidate>
            <div className="nxq-grid2">
              <label className="nxq-field">
                <span>First name</span>
                <input className="nxq-input" value={first_name} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
              </label>
              <label className="nxq-field">
                <span>Last name</span>
                <input className="nxq-input" value={last_name} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </label>
            </div>

            <label className="nxq-field">
              <span>Mobile phone <span className="nxq-req">(required — the number we call)</span></span>
              <input className="nxq-input" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" required />
            </label>

            <label className="nxq-field">
              <span>Email <span className="nxq-req">(required — for your appointment confirmation)</span></span>
              <input className="nxq-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </label>

            <label className="nxq-consent">
              <input type="checkbox" checked={consent_call} onChange={(e) => setConsentCall(e.target.checked)} />
              <span>
                I authorize NXG Life Group to contact me at the number provided for a brief consultation call,
                including through an automated or AI-assisted dialing system. Consent isn't a condition of purchase.
                Calling rates may apply. I can ask to stop at any time.
              </span>
            </label>

            <label className="nxq-consent">
              <input type="checkbox" checked={consent_email} onChange={(e) => setConsentEmail(e.target.checked)} />
              <span>
                Email me my recap and helpful follow-ups. I can unsubscribe anytime. (Your appointment confirmation
                is sent either way.)
              </span>
            </label>

            {errorMsg ? <p className="nxq-error" role="alert">{errorMsg}</p> : null}

            <button type="submit" className="nxq-btn nxq-btn--primary" style={{ width: "100%" }}>
              Get my call →
            </button>
          </form>
        </div>

        <p className="nxq-legal">
          Educational follow-up only — not financial advice. California residents: see our privacy practices.
        </p>
      </div>
    </div>
  );
}
