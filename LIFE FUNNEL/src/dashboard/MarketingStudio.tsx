import { useEffect, useRef, useState } from "react";

/**
 * Admin Marketing Studio — generate on-brand images and short videos with the
 * Runway Dev API. The browser never sees the Runway key: it POSTs the prompt to
 * the `runway-generate` Netlify function (server-side key), then polls
 * `runway-task` until the generation finishes.
 *
 * Model / ratio / duration options come from the installed @runwayml/sdk types.
 * Which models your organization can actually call depends on your account —
 * change the model field if one isn't available to you (see the Dev docs or MCP
 * `list_models`).
 */

type Kind = "image" | "video";
type Phase = "idle" | "submitting" | "polling" | "done" | "error";

const IMAGE_MODELS = ["gen4_image", "gpt_image_2", "gemini_image_3_pro", "seedream5_pro"];
const VIDEO_MODELS = ["gen4.5", "veo3.1", "veo3.1_fast", "seedance2"];
const IMAGE_RATIOS = ["1920:1080", "1080:1920", "1024:1024", "1440:1080", "1080:1440", "1280:720", "720:1280"];
const VIDEO_RATIOS = ["1280:720", "720:1280", "1920:1080", "1080:1920"];

export function MarketingStudio({ demo = false }: { demo?: boolean }) {
  const [kind, setKind] = useState<Kind>("image");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(IMAGE_MODELS[0]);
  const [ratio, setRatio] = useState(IMAGE_RATIOS[0]);
  const [duration, setDuration] = useState(5);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState<string | null>(null);
  const [cost, setCost] = useState<number | null>(null);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; }, []);

  // Keep model/ratio valid when switching modality.
  function switchKind(next: Kind) {
    setKind(next);
    setModel(next === "video" ? VIDEO_MODELS[0] : IMAGE_MODELS[0]);
    setRatio(next === "video" ? VIDEO_RATIOS[0] : IMAGE_RATIOS[0]);
  }

  async function generate() {
    if (demo) { setError("Preview only — deploy with RUNWAYML_API_SECRET set to generate."); setPhase("error"); return; }
    setError(null); setOutputs([]); setStatus(null); setCost(null);
    setPhase("submitting");
    cancelled.current = false;

    try {
      const res = await fetch("/.netlify/functions/runway-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, prompt, model, ratio, duration }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `Request failed (${res.status})`);

      setCost(data.estimatedCost?.credits ?? null);
      setPhase("polling");
      setStatus("PENDING");
      await poll(data.id);
    } catch (e) {
      if (cancelled.current) return;
      setError(e instanceof Error ? e.message : "Generation failed.");
      setPhase("error");
    }
  }

  async function poll(id: string) {
    const started = Date.now();
    const MAX_MS = 6 * 60 * 1000; // give up after 6 minutes
    while (!cancelled.current) {
      await new Promise((r) => setTimeout(r, 3000));
      if (cancelled.current) return;
      const res = await fetch(`/.netlify/functions/runway-task?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Status check failed.");
      setStatus(data.status);

      if (data.status === "SUCCEEDED") {
        setOutputs(Array.isArray(data.output) ? data.output : []);
        setPhase("done");
        return;
      }
      if (data.status === "FAILED" || data.status === "CANCELLED") {
        throw new Error(data.failure || `Task ${data.status.toLowerCase()}.`);
      }
      if (Date.now() - started > MAX_MS) throw new Error("Timed out waiting for the generation.");
    }
  }

  const busy = phase === "submitting" || phase === "polling";
  const models = kind === "video" ? VIDEO_MODELS : IMAGE_MODELS;
  const ratios = kind === "video" ? VIDEO_RATIOS : IMAGE_RATIOS;

  return (
    <div className="studio">
      <div className="dash-head">
        <p className="eyebrow">Runway Dev</p>
        <h2>Marketing Studio</h2>
      </div>

      <div className="studio-grid">
        {/* Controls */}
        <div className="dash-panel studio-form">
          <div className="studio-toggle" role="tablist" aria-label="Generation type">
            <button className={kind === "image" ? "is-on" : ""} onClick={() => switchKind("image")} role="tab" aria-selected={kind === "image"}>Image</button>
            <button className={kind === "video" ? "is-on" : ""} onClick={() => switchKind("video")} role="tab" aria-selected={kind === "video"}>Video</button>
          </div>

          <div className="dash-field">
            <label htmlFor="prompt">Prompt</label>
            <textarea
              id="prompt"
              className="dash-textarea"
              value={prompt}
              maxLength={1000}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={kind === "video"
                ? "A calm cinematic shot of a California family home at golden hour, gentle camera push-in…"
                : "A warm, trustworthy hero image: a California family reviewing plans at a sunlit kitchen table, soft gold accents…"}
            />
            <span className="studio-count">{prompt.length}/1000</span>
          </div>

          <div className="studio-row">
            <div className="dash-field">
              <label htmlFor="model">Model</label>
              <input id="model" className="dash-input" list="studio-models" value={model} onChange={(e) => setModel(e.target.value)} />
              <datalist id="studio-models">
                {models.map((m) => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div className="dash-field">
              <label htmlFor="ratio">Ratio</label>
              <select id="ratio" className="dash-select" value={ratio} onChange={(e) => setRatio(e.target.value)}>
                {ratios.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {kind === "video" ? (
              <div className="dash-field studio-dur">
                <label htmlFor="dur">Seconds</label>
                <input id="dur" className="dash-input" type="number" min={1} max={20} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 5)} />
              </div>
            ) : null}
          </div>

          <button className="dash-btn dash-btn--primary" onClick={generate} disabled={busy || !prompt.trim()} style={{ minHeight: 46 }}>
            {phase === "submitting" ? "Submitting…" : phase === "polling" ? `Generating… (${status ?? "…"})` : `Generate ${kind}`}
          </button>

          {cost != null ? <p className="studio-cost">Estimated cost: up to {cost} credits</p> : null}
          {error ? <p className="dash-saved" style={{ color: "var(--danger)" }} role="alert">{error}</p> : null}
          {demo ? <p className="studio-note">This is a preview. Deploy with <code>RUNWAYML_API_SECRET</code> set to actually generate.</p> : null}
        </div>

        {/* Output */}
        <div className="dash-panel studio-output">
          {phase === "done" && outputs.length > 0 ? (
            <div className="studio-results">
              {outputs.map((url) =>
                kind === "video" ? (
                  <video key={url} src={url} controls playsInline className="studio-media" />
                ) : (
                  <img key={url} src={url} alt="Generated result" className="studio-media" />
                ),
              )}
              <a className="dash-btn" href={outputs[0]} target="_blank" rel="noreferrer">Open / download</a>
              <p className="studio-note">Output URLs expire in ~24–48h — save anything you want to keep.</p>
            </div>
          ) : busy ? (
            <div className="studio-placeholder">
              <span className="studio-spinner" aria-hidden />
              <p>{phase === "submitting" ? "Submitting to Runway…" : `Rendering… status: ${status}`}</p>
              <p className="studio-note">Video can take a few minutes. You can keep this tab open.</p>
            </div>
          ) : (
            <div className="studio-placeholder">
              <p>Your generated {kind} will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
