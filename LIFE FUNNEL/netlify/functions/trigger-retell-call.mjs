/**
 * Netlify serverless function — triggers an instant outbound call from your
 * Retell agent ("Greece") the moment a lead submits the results-page form.
 *
 * The funnel front-end POSTs the LeadPayload here; this function calls Retell's
 * create-phone-call API using a SERVER-SIDE key so the key is never exposed to
 * the browser.
 *
 * Required Netlify environment variables (Site settings → Environment variables):
 *   RETELL_API_KEY      Your Retell secret API key (keep private).
 *   RETELL_FROM_NUMBER  The Retell number Greece calls FROM, in E.164 (e.g. +16195551234).
 * Optional:
 *   RETELL_AGENT_ID     Force a specific agent (Greece) via override_agent_id.
 *   LEAD_FORWARD_WEBHOOK A Make/Zapier/CRM webhook to also receive the raw lead JSON.
 *
 * Docs: https://docs.retellai.com/api-references/create-phone-call
 */

const RETELL_ENDPOINT = "https://api.retellai.com/v2/create-phone-call";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

/** Normalize a US/E.164 phone to strict E.164, or null if not valid. */
function toE164(raw) {
  if (!raw) return null;
  const cleaned = String(raw).trim();
  if (cleaned.startsWith("+")) {
    const d = cleaned.replace(/[^\d]/g, "");
    return d.length >= 11 && d.length <= 15 ? `+${d}` : null;
  }
  const d = cleaned.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

function json(statusCode, obj) {
  return { statusCode, headers: CORS, body: JSON.stringify(obj) };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed." });

  let lead;
  try {
    lead = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid request." });
  }

  const to = toE164(lead.phone);
  if (!to) return json(422, { ok: false, error: "A valid mobile number is required." });
  if (lead.consent_call === false) {
    return json(422, { ok: false, error: "Call consent is required before we can call you." });
  }

  // Mirror the raw lead to a CRM/automation webhook if configured (best-effort).
  const forward = process.env.LEAD_FORWARD_WEBHOOK;
  if (forward) {
    try {
      await fetch(forward, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch {
      /* non-fatal — do not block the call on CRM delivery */
    }
  }

  const apiKey = process.env.RETELL_API_KEY;
  const from = toE164(process.env.RETELL_FROM_NUMBER) || process.env.RETELL_FROM_NUMBER;
  if (!apiKey || !from) {
    return json(500, { ok: false, error: "Calling service is not configured yet. Please book a time instead." });
  }

  const agentId = process.env.RETELL_AGENT_ID;
  const customerName = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "there";

  const payload = {
    from_number: from,
    to_number: to,
    ...(agentId ? { override_agent_id: agentId } : {}),
    // Passed to Greece so it can greet by name and reference the quiz answers.
    retell_llm_dynamic_variables: {
      customer_name: customerName,
      primary_concern: lead?.answers?.primary_concern ?? "",
      decision_timeline: lead?.answers?.decision_timeline ?? "",
      employment: lead?.answers?.employment ?? "",
      source: "life_funnel",
    },
    metadata: {
      source: "life_funnel",
      page: lead.page ?? "",
      pipeline_stage: lead.pipeline_stage ?? "",
      tags: Array.isArray(lead.tags) ? lead.tags.join(",") : "",
      email: lead.email ?? "",
    },
  };

  try {
    const res = await fetch(RETELL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[trigger-retell-call] Retell error", res.status, detail);
      return json(502, {
        ok: false,
        error: "We couldn’t start your call just now. Please try again or book a time.",
      });
    }

    const data = await res.json().catch(() => ({}));
    return json(200, { ok: true, call_id: data.call_id ?? null });
  } catch (err) {
    console.error("[trigger-retell-call] network error", err);
    return json(502, { ok: false, error: "Network error starting your call. Please try again." });
  }
};
