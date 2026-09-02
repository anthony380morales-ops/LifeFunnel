/**
 * Netlify serverless function — submits a Runway generation task.
 *
 * The admin Marketing Studio POSTs a prompt here; this calls the Runway Dev API
 * with the official @runwayml/sdk using a SERVER-SIDE key so the key is never
 * exposed to the browser. Because video generations can take minutes (longer
 * than a synchronous Netlify function may run), this endpoint only *creates* the
 * task and returns its id + estimated cost. The client then polls
 * `runway-task` for status/output. (One submit, no resubmit.)
 *
 * Required Netlify environment variable (Site settings → Environment variables):
 *   RUNWAYML_API_SECRET   Your Runway Dev organization API key (keep private).
 *
 * Contract (from the installed @runwayml/sdk types — the authoritative schema):
 *   client.textToImage.create({ model, promptText, ratio, referenceImages? })
 *   client.textToVideo.create({ model, promptText, ratio, duration })
 *   → { id, estimatedCost: { credits } }
 *
 * Model/ratio/duration options vary by account. See the Dev docs
 * (https://docs.dev.runwayml.com/llms.txt) or MCP `list_models` for what your
 * organization can call and each model's constraints.
 */

import RunwayML from "@runwayml/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const json = (statusCode, obj) => ({ statusCode, headers: CORS, body: JSON.stringify(obj) });

// Safe defaults drawn from the SDK's own typed enums (not guessed from memory).
// These are text-friendly models that need no reference image.
const DEFAULTS = {
  image: { model: "gen4_image", ratio: "1920:1080" },
  video: { model: "gen4.5", ratio: "1280:720", duration: 5 },
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Method not allowed." });

  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) {
    return json(500, {
      ok: false,
      error: "RUNWAYML_API_SECRET is not set. Add it in Netlify → Site settings → Environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  const kind = body.kind === "video" ? "video" : "image";
  const promptText = (body.prompt || "").toString().trim();
  if (!promptText) return json(400, { ok: false, error: "A prompt is required." });
  if (promptText.length > 1000) return json(400, { ok: false, error: "Prompt must be 1000 characters or fewer." });

  const model = (body.model || DEFAULTS[kind].model).toString();
  const ratio = (body.ratio || DEFAULTS[kind].ratio).toString();

  const client = new RunwayML({ apiKey });

  try {
    let created;
    if (kind === "video") {
      const duration = Number(body.duration) || DEFAULTS.video.duration;
      // Submit only — do NOT chain waitForTaskOutput here (would exceed the
      // function timeout). The client polls runway-task for the result.
      created = await client.textToVideo.create({ model, promptText, ratio, duration });
    } else {
      const params = { model, promptText, ratio };
      // gen4_image_turbo requires reference images; forward them if provided.
      if (Array.isArray(body.referenceImages) && body.referenceImages.length > 0) {
        params.referenceImages = body.referenceImages;
      }
      created = await client.textToImage.create(params);
    }

    return json(200, {
      ok: true,
      id: created.id,
      kind,
      model,
      ratio,
      estimatedCost: created.estimatedCost ?? null,
    });
  } catch (err) {
    // Surface Runway validation / auth / API errors clearly.
    const status = err?.status || err?.statusCode || 502;
    const message = err?.error?.error || err?.message || "Runway request failed.";
    return json(typeof status === "number" && status >= 400 && status < 600 ? status : 502, {
      ok: false,
      error: message,
      code: err?.code ?? null,
    });
  }
}
