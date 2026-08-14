import type { LeadPayload, QuizAnswers } from "@/types/funnel";
import { buildSegmentTags, isQuizComplete } from "@/lib/quizLogic";
import { stageFromSignals } from "@/lib/crm";
import { trackEvent } from "@/lib/analytics";

export interface SubmitLeadInput {
  answers: QuizAnswers;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  consent_email: boolean;
  consent_sms: boolean;
  page: string;
  clickedCallBefore?: boolean;
  bookedCalendarBefore?: boolean;
  session_started_at?: string;
}

function buildPayload(input: SubmitLeadInput): LeadPayload {
  const quizCompleted = isQuizComplete(input.answers);
  const quizStarted = Object.keys(input.answers).length > 0;
  const pipeline_stage = stageFromSignals({
    quizCompleted,
    quizStarted,
    clickedCall: !!input.clickedCallBefore,
    bookedCalendar: !!input.bookedCalendarBefore,
  });

  return {
    source: "funnel_quiz",
    page: input.page,
    answers: input.answers,
    tags: buildSegmentTags(input.answers),
    consent_email: input.consent_email,
    consent_sms: input.consent_sms,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
    pipeline_stage,
    submitted_at: new Date().toISOString(),
    session_started_at: input.session_started_at,
  };
}

/** POST JSON to VITE_LEAD_WEBHOOK_URL — Zapier/Make/n8n/custom API */
export async function submitLead(input: SubmitLeadInput): Promise<{ ok: boolean; error?: string }> {
  const payload = buildPayload(input);
  const url = import.meta.env.VITE_LEAD_WEBHOOK_URL;

  trackEvent("lead_capture_submit", {
    pipeline_stage: payload.pipeline_stage,
    tags: payload.tags,
  });

  if (!url) {
    if (import.meta.env.DEV) {
      console.warn("[leadSubmission] VITE_LEAD_WEBHOOK_URL not set — payload:", payload);
      return { ok: true };
    }
    trackEvent("lead_capture_error", { reason: "missing_webhook_url" });
    return { ok: false, error: "Lead endpoint not configured." };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      trackEvent("lead_capture_error", { status: res.status });
      return { ok: false, error: "Could not save your info. Please call us directly." };
    }
    return { ok: true };
  } catch {
    trackEvent("lead_capture_error", { reason: "network" });
    return { ok: false, error: "Network error. Please try again or call." };
  }
}
