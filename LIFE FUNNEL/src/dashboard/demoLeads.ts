import type { Lead } from "@/dashboard/supabase";

/**
 * Sample leads for `/dashboard?demo` — a credential-free preview of the command
 * center before real submissions flow in. Purely client-side; no writes.
 */
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const DEMO_LEADS: Lead[] = [
  {
    id: "demo-1", created_at: hoursAgo(0.4), updated_at: hoursAgo(0.4),
    first_name: "Marcus", last_name: "Ruiz", email: "marcus.ruiz@example.com", phone: "+16195550142",
    primary_concern: "protect_family", primary_concern_label: "Protecting my family", intent: "PROTECTION",
    quiz_answers: { employment: "W-2 employee", income_range: "$150k–$250k", primary_concern: "protect_family", timeline: "1–3 months" },
    tags: ["focus:protection", "intent:high"],
    consent_call: true, consent_email: true, consent_sms: false,
    pipeline_stage: "call_intent", call_status: "dialing", call_outcome: null,
    retell_call_id: "call_abc", transcript: null, transcript_url: null, recording_url: null,
    appointment_at: null, opted_out: false, notes: null,
  },
  {
    id: "demo-2", created_at: hoursAgo(2), updated_at: hoursAgo(1.6),
    first_name: "Dana", last_name: "Whitfield", email: "dana.w@example.com", phone: "+14155550117",
    primary_concern: "retirement_income", primary_concern_label: "Retirement income", intent: "RETIREMENT",
    quiz_answers: { employment: "Business owner / self-employed", income_range: "$250k+", primary_concern: "retirement_income", timeline: "ASAP" },
    tags: ["focus:retirement", "intent:high"],
    consent_call: true, consent_email: true, consent_sms: true,
    pipeline_stage: "booked", call_status: "completed", call_outcome: "BOOKED",
    retell_call_id: "call_def", transcript: null, transcript_url: "https://example.com/t/def", recording_url: "https://example.com/r/def",
    appointment_at: hoursAgo(-26), opted_out: false, notes: "Wants to review IUL vs annuity ladder.",
  },
  {
    id: "demo-3", created_at: hoursAgo(5), updated_at: hoursAgo(4.5),
    first_name: "Priya", last_name: "Nair", email: "priya.nair@example.com", phone: "+13105550188",
    primary_concern: "legacy", primary_concern_label: "Building a legacy", intent: "IBC",
    quiz_answers: { employment: "Business owner / self-employed", income_range: "$250k+", primary_concern: "legacy", timeline: "Just exploring" },
    tags: ["focus:ibc", "intent:medium"],
    consent_call: true, consent_email: false, consent_sms: false,
    pipeline_stage: "transferred", call_status: "completed", call_outcome: "TRANSFERRED",
    retell_call_id: "call_ghi", transcript: null, transcript_url: "https://example.com/t/ghi", recording_url: "https://example.com/r/ghi",
    appointment_at: null, opted_out: false, notes: null,
  },
  {
    id: "demo-4", created_at: hoursAgo(26), updated_at: hoursAgo(25),
    first_name: "Leon", last_name: "Baptiste", email: "leon.b@example.com", phone: "+16505550153",
    primary_concern: "grow_safely", primary_concern_label: "Growing money safely", intent: "RETIREMENT",
    quiz_answers: { employment: "W-2 employee", income_range: "$100k–$150k", primary_concern: "grow_safely", timeline: "3–6 months" },
    tags: ["focus:retirement", "intent:medium"],
    consent_call: true, consent_email: true, consent_sms: false,
    pipeline_stage: "converted", call_status: "completed", call_outcome: "BOOKED",
    retell_call_id: "call_jkl", transcript: null, transcript_url: null, recording_url: "https://example.com/r/jkl",
    appointment_at: hoursAgo(20), opted_out: false, notes: "Closed — fixed annuity + term ladder.",
  },
  {
    id: "demo-5", created_at: hoursAgo(30), updated_at: hoursAgo(29),
    first_name: "Sofia", last_name: "Kent", email: "sofia.kent@example.com", phone: "+18585550129",
    primary_concern: "taxes", primary_concern_label: "Tax-aware strategies", intent: null,
    quiz_answers: { employment: "Mix of W-2 and business", income_range: "$250k+", primary_concern: "taxes", timeline: "1–3 months" },
    tags: ["focus:tax"],
    consent_call: false, consent_email: true, consent_sms: false,
    pipeline_stage: "new_lead", call_status: null, call_outcome: null,
    retell_call_id: null, transcript: null, transcript_url: null, recording_url: null,
    appointment_at: null, opted_out: false, notes: null,
  },
  {
    id: "demo-6", created_at: hoursAgo(52), updated_at: hoursAgo(50),
    first_name: "Ray", last_name: "Okafor", email: "ray.okafor@example.com", phone: "+12135550164",
    primary_concern: "protect_family", primary_concern_label: "Protecting my family", intent: "PROTECTION",
    quiz_answers: { employment: "W-2 employee", income_range: "$75k–$100k", primary_concern: "protect_family", timeline: "Just exploring" },
    tags: ["focus:protection", "compliance:dnc"],
    consent_call: false, consent_email: false, consent_sms: false,
    pipeline_stage: "dnc", call_status: "completed", call_outcome: "DNC",
    retell_call_id: "call_mno", transcript: null, transcript_url: null, recording_url: null,
    appointment_at: null, opted_out: true, notes: "Requested do-not-contact on the call.",
  },
];
