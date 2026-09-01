/**
 * Netlify serverless function — Retell post-call webhook.
 *
 * Point your Retell agent's webhook at:
 *   https://YOUR-SITE.netlify.app/.netlify/functions/retell-post-call
 *
 * On each call event Retell POSTs here; we update the matching lead row (by
 * retell_call_id) in Supabase with the call status, outcome, transcript,
 * recording, and — if Greece booked — the appointment. Best-effort; never blocks.
 *
 * Required Netlify environment variables:
 *   SUPABASE_URL                Your Supabase project URL.
 *   SUPABASE_SERVICE_ROLE_KEY   Service role key (server-side only, keep secret).
 *
 * Docs: https://docs.retellai.com/features/webhook
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(statusCode, obj) {
  return { statusCode, headers: CORS, body: JSON.stringify(obj) };
}

/** Map Greece's booking/outcome to a pipeline stage. */
function stageFromOutcome(outcome) {
  switch ((outcome || "").toUpperCase()) {
    case "TRANSFERRED":
      return "transferred";
    case "BOOKED":
      return "booked";
    case "DNC":
      return "dnc";
    case "OUT_OF_STATE":
      return "closed_lost";
    case "NO_BOOKING":
      return "contacted";
    default:
      return undefined;
  }
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed." });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Nothing to write to; acknowledge so Retell doesn't retry forever.
    return json(200, { ok: true, note: "supabase_not_configured" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON." });
  }

  const call = body.call || body.data || body;
  const callId = call.call_id || call.callId;
  if (!callId) return json(200, { ok: true, note: "no_call_id" });

  const eventType = body.event || body.event_type || "";
  const analysis = call.call_analysis || {};
  const custom = analysis.custom_analysis_data || call.retell_llm_dynamic_variables || {};

  // Pull outcome/intent/appointment from post-call extraction (key names vary by config).
  const outcome = custom.outcome || custom.booking_status || custom.call_outcome || null;
  const intent = custom.intent || null;
  const apptRaw = custom.appointment_time_pt || custom.appointment_time || null;

  const patch = { updated_at: new Date().toISOString() };

  if (eventType.includes("ended") || eventType.includes("analyzed") || call.call_status === "ended") {
    patch.call_status = "completed";
  }
  if (typeof call.transcript === "string" && call.transcript) patch.transcript = call.transcript;
  if (call.recording_url) patch.recording_url = call.recording_url;
  if (outcome) {
    patch.call_outcome = String(outcome).toUpperCase();
    const stage = stageFromOutcome(outcome);
    if (stage) patch.pipeline_stage = stage;
    if (String(outcome).toUpperCase() === "DNC") patch.opted_out = true;
  }
  if (intent) patch.intent = String(intent).toUpperCase();
  if (apptRaw) {
    const d = new Date(apptRaw);
    if (!Number.isNaN(d.getTime())) patch.appointment_at = d.toISOString();
    else patch.notes = `Requested time: ${apptRaw}`;
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?retell_call_id=eq.${encodeURIComponent(callId)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      },
    );
    if (!res.ok) {
      console.error("[retell-post-call] supabase patch failed", res.status, await res.text().catch(() => ""));
      return json(200, { ok: false, note: "patch_failed" });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error("[retell-post-call] error", err);
    return json(200, { ok: false, note: "error" });
  }
};
