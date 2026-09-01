import type { Lead } from "@/dashboard/supabase";

/** Pipeline stages, in flow order — used for the drawer's stage <select>. */
export const PIPELINE_STAGES = [
  "new_lead",
  "call_intent",
  "transferred",
  "contacted",
  "booked",
  "converted",
  "closed_lost",
  "dnc",
] as const;

export const STAGE_LABEL: Record<string, string> = {
  new_lead: "New lead",
  call_intent: "Call intent",
  transferred: "Transferred",
  contacted: "Contacted",
  booked: "Booked",
  converted: "Converted",
  closed_lost: "Closed / lost",
  dnc: "Do not contact",
};

/**
 * Bucket a lead into the four intent categories the dashboard reports.
 * Prefers the intent captured on the call; otherwise derives it from the
 * quiz's primary_concern.
 */
export function intentBucket(lead: Lead): "Protection" | "Retirement" | "IBC" | "Other" {
  const intent = (lead.intent ?? "").toUpperCase();
  if (intent === "PROTECTION") return "Protection";
  if (intent === "RETIREMENT") return "Retirement";
  if (intent === "IBC") return "IBC";

  switch ((lead.primary_concern ?? "").toLowerCase()) {
    case "protect_family":
      return "Protection";
    case "retirement_income":
    case "grow_safely":
      return "Retirement";
    case "legacy":
      return "IBC";
    default:
      return "Other";
  }
}

/** Leads still waiting on outreach (not yet booked/converted/closed/DNC). */
export function isAwaitingAction(l: Lead): boolean {
  const stage = l.pipeline_stage ?? "new_lead";
  return !l.opted_out && ["new_lead", "call_intent", "transferred", "contacted"].includes(stage);
}

/**
 * TCPA calling window check — legal to call only 8am–9pm in the contact's
 * local time. We approximate with California (America/Los_Angeles), the state
 * NXG serves; the window is configurable in Settings later.
 */
export function callWindow(tz = "America/Los_Angeles", now = new Date()): { open: boolean; label: string } {
  let hour = now.getHours();
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);
    const h = parts.find((p) => p.type === "hour")?.value;
    if (h != null) hour = Number(h) % 24;
  } catch {
    /* fall back to local hour */
  }
  const open = hour >= 8 && hour < 21;
  return { open, label: open ? "Calling window open" : "Quiet hours (TCPA)" };
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function fullName(l: Lead): string {
  return [l.first_name, l.last_name].filter(Boolean).join(" ") || "Unknown lead";
}

/**
 * Re-dial a lead from the dashboard by POSTing the lead back to the existing
 * Netlify function (same contract the funnel uses). Returns an error string on
 * failure, or null on success.
 */
export async function recallLead(lead: Lead): Promise<string | null> {
  try {
    const res = await fetch("/.netlify/functions/trigger-retell-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "dashboard_recall",
        first_name: lead.first_name ?? "",
        last_name: lead.last_name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        answers: lead.quiz_answers ?? {},
        tags: lead.tags ?? [],
        consent_call: lead.consent_call ?? true,
        consent_email: lead.consent_email ?? false,
        consent_sms: lead.consent_sms ?? false,
        pipeline_stage: "call_intent",
        submitted_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) return `Re-call failed (${res.status})`;
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Re-call failed";
  }
}
