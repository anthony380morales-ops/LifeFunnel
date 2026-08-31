/**
 * Netlify serverless function — sends an appointment-confirmation SMS via Twilio.
 *
 * Designed to be called by Greece as a Retell "custom function" right after a
 * booking succeeds, OR from a Retell post-call webhook. Keeps Twilio credentials
 * server-side (never in the browser or the agent).
 *
 * Required Netlify environment variables:
 *   TWILIO_ACCOUNT_SID   Your Twilio Account SID (starts with AC...)
 *   TWILIO_AUTH_TOKEN    Your Twilio Auth Token (secret)
 *   TWILIO_FROM_NUMBER   Your A2P-registered Twilio number, E.164 (e.g. +16195551234)
 * Optional:
 *   BUSINESS_NAME        Sender name used in the message body (default: "NXG Life Group")
 *
 * NOTE: US SMS requires A2P 10DLC registration. A Sole-Proprietor brand
 * (no LLC/EIN needed) is enough — see the walkthrough. Until the number is
 * registered, carriers will filter these messages.
 *
 * Request body (JSON): { "to": "+1...", "name": "Jane", "appointment_time": "tomorrow at 10:00 AM PST" }
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

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

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid request." });
  }

  const to = toE164(body.to);
  if (!to) return json(422, { ok: false, error: "A valid recipient phone number is required." });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return json(500, { ok: false, error: "SMS is not configured yet." });
  }

  const brand = process.env.BUSINESS_NAME || "NXG Life Group";
  const name = (body.name || "there").toString().trim();
  const when = (body.appointment_time || "the scheduled time").toString().trim();
  const text =
    body.message ||
    `Hi ${name}, this confirms your ${brand} strategy call for ${when}. ` +
      `Reply STOP to opt out. We look forward to speaking with you.`;

  const form = new URLSearchParams({ To: to, From: from, Body: text });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[send-confirmation-sms] Twilio error", res.status, data);
      return json(502, { ok: false, error: data.message || "Could not send the confirmation text." });
    }
    return json(200, { ok: true, sid: data.sid ?? null });
  } catch (err) {
    console.error("[send-confirmation-sms] network error", err);
    return json(502, { ok: false, error: "Network error sending the text." });
  }
};
