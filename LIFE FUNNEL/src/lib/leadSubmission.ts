import type { LeadPayload, QuizAnswers } from "@/types/funnel";
import { buildSegmentTags, isQuizComplete } from "@/lib/quizLogic";
import { stageFromSignals } from "@/lib/crm";
import { trackEvent } from "@/lib/analytics";
import { toE164 } from "@/lib/phone";

/** Default same-origin serverless endpoint that triggers the Retell (Greece) outbound call. */
const DEFAULT_CALL_ENDPOINT = "/.netlify/functions/trigger-retell-call";

export interface SubmitLeadInput {
  answers: QuizAnswers;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  consent_email: boolean;
  consent_sms: boolean;
  consent_call: boolean;
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
    consent_call: input.consent_call,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: toE164(input.phone) ?? input.phone,
    pipeline_stage,
    submitted_at: new Date().toISOString(),
    session_started_at: input.session_started_at,
  };
}

/**
 * Submits the lead and triggers the instant Greece (Retell) callback.
 * POSTs to the same-origin Netlify function by default; a `VITE_LEAD_WEBHOOK_URL`
 * override lets you route through Make/Zapier/n8n or a custom API instead.
 */
export async function submitLead(input: SubmitLeadInput): Promise<{ ok: boolean; error?: string }> {
  const payload = buildPayload(input);
  const override = import.meta.env.VITE_LEAD_WEBHOOK_URL;
  const url = override || DEFAULT_CALL_ENDPOINT;

  trackEvent("lead_capture_submit", {
    pipeline_stage: payload.pipeline_stage,
    tags: payload.tags,
  });

  // In local dev without an override, simulate success (the function only exists on Netlify).
  if (!override && import.meta.env.DEV) {
    console.warn("[leadSubmission] dev mode — no VITE_LEAD_WEBHOOK_URL; simulating Greece callback trigger:", payload);
    return { ok: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let error = "We couldn’t start your call just now. Please try again in a moment.";
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) error = data.error;
      } catch {
        /* ignore parse error */
      }
      trackEvent("lead_capture_error", { status: res.status });
      return { ok: false, error };
    }
    return { ok: true };
  } catch {
    trackEvent("lead_capture_error", { reason: "network" });
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}
