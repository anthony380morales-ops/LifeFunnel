/**
 * Client-side automation triggers — pair with server/Zapier for SMS, email, DM.
 * Full workflow definitions: docs/automation-workflows.md
 */

import { trackEvent } from "@/lib/analytics";
import type { QuizAnswers } from "@/types/funnel";

const STORAGE_PREFIX = "nxg_funnel_";

export function persistPartialQuiz(answers: QuizAnswers, stepIndex: number): void {
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}quiz`,
      JSON.stringify({ answers, stepIndex, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore quota */
  }
}

export function loadPartialQuiz(): { answers: QuizAnswers; stepIndex: number } | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}quiz`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers: QuizAnswers; stepIndex: number };
    return parsed;
  } catch {
    return null;
  }
}

export function clearPartialQuiz(): void {
  sessionStorage.removeItem(`${STORAGE_PREFIX}quiz`);
}

export function recordSessionStart(): void {
  try {
    if (!sessionStorage.getItem(`${STORAGE_PREFIX}started`)) {
      sessionStorage.setItem(`${STORAGE_PREFIX}started`, new Date().toISOString());
    }
  } catch {
    /* ignore */
  }
}

export function getSessionStartedAt(): string | undefined {
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}started`) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Fire-and-forget beacon for incomplete quiz / abandon — optional endpoint */
export function pingAutomationEndpoint(event: string, body: Record<string, unknown>): void {
  const base = import.meta.env.VITE_LEAD_WEBHOOK_URL;
  if (!base || typeof navigator === "undefined") return;
  const payload = JSON.stringify({ event, ...body, ts: new Date().toISOString() });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(base, blob);
    }
  } catch {
    /* ignore */
  }
}

export function trackQuizAbandoned(answers: QuizAnswers, stepIndex: number): void {
  trackEvent("quiz_abandoned", { stepIndex, partialKeys: Object.keys(answers) });
  pingAutomationEndpoint("quiz_abandoned", { answers, stepIndex });
}

export function trackCallClick(displayPhone: string): void {
  trackEvent("cta_call_click", { label: displayPhone });
  trackEvent("retargeting_seed", { audience: "call_clickers" });
}

export function trackCalendarClick(url: string): void {
  trackEvent("cta_calendar_click", { url });
  trackEvent("retargeting_seed", { audience: "calendar_clickers" });
}
