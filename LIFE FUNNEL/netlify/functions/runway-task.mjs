/**
 * Netlify serverless function — polls a Runway generation task.
 *
 * The admin Marketing Studio created a task via `runway-generate`, then calls
 * this endpoint (GET ?id=<taskId>) until the task reaches a terminal state.
 * Uses the official @runwayml/sdk with the SERVER-SIDE key.
 *
 * Task lifecycle (from the SDK types): PENDING → RUNNING → SUCCEEDED | FAILED
 * (also THROTTLED, CANCELLED). On SUCCEEDED, `output` is an array of URLs that
 * expire in ~24–48h — persist anything you need to keep.
 */

import RunwayML from "@runwayml/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const json = (statusCode, obj) => ({ statusCode, headers: CORS, body: JSON.stringify(obj) });

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") return json(405, { ok: false, error: "Method not allowed." });

  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) return json(500, { ok: false, error: "RUNWAYML_API_SECRET is not set." });

  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { ok: false, error: "Missing task id (?id=)." });

  const client = new RunwayML({ apiKey });

  try {
    const task = await client.tasks.retrieve(id);
    return json(200, {
      ok: true,
      id: task.id,
      status: task.status, // PENDING | THROTTLED | RUNNING | SUCCEEDED | FAILED | CANCELLED
      output: task.status === "SUCCEEDED" ? task.output ?? [] : [],
      progress: task.progress ?? null,
      failure: task.failure ?? null,
      failureCode: task.failureCode ?? null,
    });
  } catch (err) {
    const status = err?.status || err?.statusCode || 502;
    const message = err?.error?.error || err?.message || "Runway task lookup failed.";
    return json(typeof status === "number" && status >= 400 && status < 600 ? status : 502, {
      ok: false,
      error: message,
    });
  }
}
