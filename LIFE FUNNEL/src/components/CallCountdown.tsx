import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useFunnel } from "@/context/FunnelContext";
import { submitLead } from "@/lib/leadSubmission";
import { getSessionStartedAt } from "@/lib/automationHooks";
import { siteConfig } from "@/site/siteConfig";

const FIRED_KEY = "nxg_funnel_call_fired";

type Phase = "counting" | "calling" | "done" | "error";

/**
 * Sticky banner shown on /results. Counts down `seconds`, then triggers the
 * Greece callback exactly once (submitLead). All funnel logic lives here so the
 * About page (AboutContent) stays pure presentation.
 */
export function CallCountdown({ seconds = siteConfig.callDelaySeconds }: { seconds?: number }) {
  const { answers, contact, setClickedCall } = useFunnel();
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<Phase>("counting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const firedRef = useRef(false);

  // Countdown tick
  useEffect(() => {
    if (phase !== "counting") return;
    if (remaining <= 0) return;
    const t = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [remaining, phase]);

  // Fire the call once when the countdown reaches zero
  useEffect(() => {
    if (phase !== "counting" || remaining > 0) return;
    if (firedRef.current) return;
    // Guard against refresh double-fire within the same session
    try {
      if (sessionStorage.getItem(FIRED_KEY)) {
        setPhase("done");
        return;
      }
    } catch {
      /* ignore */
    }
    if (!contact) {
      setPhase("error");
      setErrorMsg("Missing your contact details — please start again.");
      return;
    }

    firedRef.current = true;
    try {
      sessionStorage.setItem(FIRED_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("calling");
    setClickedCall(true);

    void submitLead({
      answers,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      consent_email: contact.consent_email,
      consent_sms: false,
      consent_call: contact.consent_call,
      page: "/results",
      clickedCallBefore: true,
      session_started_at: getSessionStartedAt(),
    }).then((res) => {
      if (res.ok) {
        setPhase("done");
      } else {
        setPhase("error");
        setErrorMsg(res.error ?? "We couldn't start your call. Please call us or try again.");
      }
    });
  }, [remaining, phase, contact, answers, setClickedCall]);

  const barStyle: CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "0.85rem 1rem",
    textAlign: "center",
    fontSize: "1rem",
    color: "var(--text, #0f172a)",
    background: "var(--accent, #c9a227)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
  };

  let message: string;
  if (phase === "counting") {
    message = `📞 Anthony's team is calling you in 0:${String(Math.max(remaining, 0)).padStart(2, "0")} — keep your phone close.`;
  } else if (phase === "calling") {
    message = "📞 Connecting your call now — answer your phone…";
  } else if (phase === "done") {
    message = "📞 We're calling you now — answer your phone. Didn't get a call? Refresh to retry.";
  } else {
    message = `⚠️ ${errorMsg ?? "Something went wrong."}`;
  }

  return (
    <div role="status" aria-live="polite" style={barStyle}>
      {message}
    </div>
  );
}
