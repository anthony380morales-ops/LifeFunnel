import { useState, type FormEvent } from "react";
import type { QuizAnswers } from "@/types/funnel";
import { submitLead } from "@/lib/leadSubmission";
import { trackEvent } from "@/lib/analytics";
import { getSessionStartedAt } from "@/lib/automationHooks";
import { toE164, formatPhoneDisplay } from "@/lib/phone";
import { useFunnel } from "@/context/FunnelContext";

interface Props {
  answers: QuizAnswers;
}

const fieldStyle = {
  minHeight: "var(--tap-min)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "rgba(15,23,42,0.65)",
  color: "var(--text)",
  padding: "0 1rem",
  fontSize: "1rem",
} as const;

export function LeadCaptureForm({ answers }: Props) {
  const { clickedCalendar, setClickedCall } = useFunnel();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent_email, setConsentEmail] = useState(false);
  const [consent_call, setConsentCall] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!toE164(phone)) {
      setErrorMsg("Enter a valid mobile number so we can call you right back.");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setErrorMsg("Enter your email so we can send your appointment confirmation.");
      return;
    }
    if (!consent_call) {
      setErrorMsg("Please check the box authorizing us to call you at this number.");
      return;
    }

    setStatus("loading");
    // Treat the callback request as a call intent for pipeline scoring.
    setClickedCall(true);
    const res = await submitLead({
      answers,
      first_name: first_name.trim() || undefined,
      last_name: last_name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim(),
      consent_email,
      consent_sms: false,
      consent_call,
      page: "/results",
      clickedCallBefore: true,
      bookedCalendarBefore: clickedCalendar,
      session_started_at: getSessionStartedAt(),
    });

    if (res.ok) {
      setStatus("success");
      trackEvent("cta_call_click", { method: "instant_callback" });
      trackEvent("email_consent_granted", { granted: consent_email });
    } else {
      setStatus("error");
      setErrorMsg(res.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="card" role="status" style={{ borderColor: "rgba(201, 162, 39, 0.45)" }}>
        <h3 style={{ marginTop: 0 }}>📞 Answer your phone — we’re calling you now</h3>
        <p className="lead" style={{ color: "var(--success)", marginBottom: "0.5rem" }}>
          Your call to {formatPhoneDisplay(phone)} is being placed right now. It usually rings within a minute — keep
          your phone close.
        </p>
        <p className="footer-note" style={{ margin: 0 }}>
          Didn’t get a call in a couple of minutes? Refresh and try again, or use the “Book a strategy session” option
          above to pick a time instead. Your number is kept confidential and consent can be revoked anytime.
        </p>
      </div>
    );
  }

  return (
    <form className="card stack" onSubmit={onSubmit} noValidate>
      <h3 style={{ marginTop: 0 }}>Get your call now — we ring you in about a minute</h3>
      <p>
        Enter your mobile number and we’ll call you right back to talk through your snapshot. No waiting on hold, no
        pushy pitch — educational conversation only.
      </p>
      <div className="grid-2">
        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>First name</span>
          <input
            className="input"
            style={fieldStyle}
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Last name</span>
          <input
            className="input"
            style={fieldStyle}
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </label>
      </div>
      <label className="stack" style={{ gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Mobile phone <span style={{ color: "var(--accent)" }}>(required — this is the number we call)</span>
        </span>
        <input
          className="input"
          style={fieldStyle}
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0100"
          required
        />
      </label>
      <label className="stack" style={{ gap: "0.35rem", alignItems: "flex-start", flexDirection: "row" }}>
        <input
          type="checkbox"
          checked={consent_call}
          onChange={(e) => setConsentCall(e.target.checked)}
          style={{ width: 22, height: 22, marginTop: 4 }}
        />
        <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
          I authorize NXG Life Group to contact me at the number provided for a brief consultation call, including
          through an automated or AI-assisted dialing system. Consent is not a condition of purchase. Calling rates may
          apply. I can ask to stop at any time during the call.
        </span>
      </label>

      <label className="stack" style={{ gap: "0.35rem" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          Email <span style={{ color: "var(--accent)" }}>(required — for your appointment confirmation)</span>
        </span>
        <input
          className="input"
          style={fieldStyle}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
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
          Also email me my clarity recap and helpful follow-ups. I can unsubscribe anytime. (Optional — your
          appointment confirmation is sent either way.)
        </span>
      </label>

      {errorMsg ? (
        <p style={{ color: "var(--danger)", margin: 0 }} role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button type="submit" className="btn btn--primary btn--call" disabled={status === "loading"}>
        {status === "loading" ? "Connecting your call…" : "📞 Call me now"}
      </button>
      <p className="footer-note" style={{ margin: 0 }}>
        California residents: see our privacy practices and how to submit requests under applicable law. We do not sell
        your personal information for monetary consideration. Educational follow-up only — not financial advice.
      </p>
    </form>
  );
}
