import { useState, type FormEvent } from "react";
import type { QuizAnswers } from "@/types/funnel";
import { submitLead } from "@/lib/leadSubmission";
import { trackEvent } from "@/lib/analytics";
import { getSessionStartedAt } from "@/lib/automationHooks";
import { useFunnel } from "@/context/FunnelContext";

interface Props {
  answers: QuizAnswers;
}

export function LeadCaptureForm({ answers }: Props) {
  const { clickedCall, clickedCalendar } = useFunnel();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent_email, setConsentEmail] = useState(false);
  const [consent_sms, setConsentSms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone.trim() && !email.trim()) {
      setErrorMsg("Please enter a phone number or email so we can follow up.");
      return;
    }
    if (email.trim() && !consent_email) {
      setErrorMsg("Check the box to consent to email, or remove your email.");
      return;
    }
    if (phone.trim() && !consent_sms) {
      setErrorMsg("Check the box to consent to SMS, or remove your phone number.");
      return;
    }

    setStatus("loading");
    const res = await submitLead({
      answers,
      first_name: first_name.trim() || undefined,
      last_name: last_name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      consent_email,
      consent_sms,
      page: "/results",
      clickedCallBefore: clickedCall,
      bookedCalendarBefore: clickedCalendar,
      session_started_at: getSessionStartedAt(),
    });

    if (res.ok) {
      setStatus("success");
      trackEvent("email_consent_granted", { granted: consent_email });
      trackEvent("sms_consent_granted", { granted: consent_sms });
    } else {
      setStatus("error");
      setErrorMsg(res.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="card" role="status">
        <h3>You’re set</h3>
        <p className="lead" style={{ color: "var(--success)", marginBottom: 0 }}>
          Thanks — we received your details. Expect a confirmation shortly if you opted in. Prefer faster help?
          Call us using the button above.
        </p>
      </div>
    );
  }

  return (
    <form className="card stack" onSubmit={onSubmit} noValidate>
      <h3>Send my snapshot &amp; optional follow-up</h3>
      <p>
        Get a written recap of your clarity snapshot and next-step prompts. Not financial advice — for educational
        follow-up only.
      </p>
      <div className="grid-2">
        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>First name</span>
          <input
            className="input"
            style={{
              minHeight: "var(--tap-min)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "rgba(15,23,42,0.65)",
              color: "var(--text)",
              padding: "0 1rem",
              fontSize: "1rem",
            }}
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Last name</span>
          <input
            className="input"
            style={{
              minHeight: "var(--tap-min)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "rgba(15,23,42,0.65)",
              color: "var(--text)",
              padding: "0 1rem",
              fontSize: "1rem",
            }}
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </label>
      </div>
      <label className="stack" style={{ gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Mobile phone</span>
        <input
          className="input"
          style={{
            minHeight: "var(--tap-min)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "rgba(15,23,42,0.65)",
            color: "var(--text)",
            padding: "0 1rem",
            fontSize: "1rem",
          }}
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0100"
        />
      </label>
      <label className="stack" style={{ gap: "0.35rem", alignItems: "flex-start", flexDirection: "row" }}>
        <input
          type="checkbox"
          checked={consent_sms}
          onChange={(e) => setConsentSms(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 4 }}
        />
        <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
          I consent to receive SMS messages from NXG Life Group at the number provided. Message frequency varies.
          Message &amp; data rates may apply. Reply STOP to opt out. This consent isn’t a condition of purchase.
        </span>
      </label>

      <label className="stack" style={{ gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Email</span>
        <input
          className="input"
          style={{
            minHeight: "var(--tap-min)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "rgba(15,23,42,0.65)",
            color: "var(--text)",
            padding: "0 1rem",
            fontSize: "1rem",
          }}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="stack" style={{ gap: "0.35rem", alignItems: "flex-start", flexDirection: "row" }}>
        <input
          type="checkbox"
          checked={consent_email}
          onChange={(e) => setConsentEmail(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 4 }}
        />
        <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
          I consent to receive email from NXG Life Group. I can unsubscribe anytime.
        </span>
      </label>

      {errorMsg ? (
        <p style={{ color: "var(--danger)", margin: 0 }} role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button type="submit" className="btn btn--secondary" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Save my recap & preferences"}
      </button>
      <p className="footer-note" style={{ margin: 0 }}>
        California residents: see our privacy practices and how to submit requests under applicable law. We do not
        sell your personal information for monetary consideration.
      </p>
    </form>
  );
}
