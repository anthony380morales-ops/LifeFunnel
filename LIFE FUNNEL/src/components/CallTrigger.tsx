import { useEffect, useRef } from "react";
import { useFunnel } from "@/context/FunnelContext";
import { submitLead } from "@/lib/leadSubmission";
import { getSessionStartedAt } from "@/lib/automationHooks";
import { siteConfig } from "@/site/siteConfig";

const FIRED_KEY = "nxg_funnel_call_fired";

/**
 * Silent trigger. Mount this anywhere on the post-questionnaire page. After
 * `delaySeconds` it places the Greece call exactly once (submitLead) — no UI,
 * no countdown, so the visitor just browses and their phone rings.
 * Guarded (localStorage) against double-fire across refreshes, new tabs, and
 * return visits — a remembered device that already got its call is never
 * re-dialed when it re-enters the portfolio.
 */
export function CallTrigger({ delaySeconds = siteConfig.callDelaySeconds }: { delaySeconds?: number }) {
  const { answers, contact, setClickedCall } = useFunnel();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!contact) return;
    try {
      if (localStorage.getItem(FIRED_KEY)) return;
    } catch {
      /* ignore */
    }

    const timer = window.setTimeout(() => {
      if (firedRef.current) return;
      try {
        if (localStorage.getItem(FIRED_KEY)) return;
        localStorage.setItem(FIRED_KEY, "1");
      } catch {
        /* ignore */
      }
      firedRef.current = true;
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
      });
    }, Math.max(0, delaySeconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [contact, answers, delaySeconds, setClickedCall]);

  return null;
}
