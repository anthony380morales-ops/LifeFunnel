import { useEffect, useState } from "react";
import { supabase, type Lead } from "@/dashboard/supabase";
import {
  PIPELINE_STAGES,
  STAGE_LABEL,
  fmtDateTime,
  fullName,
  intentBucket,
  recallLead,
} from "@/dashboard/leadHelpers";

/**
 * Lead detail drawer: full contact + consent, every quiz answer, call
 * status/outcome, transcript + recording links, appointment, editable stage +
 * notes, and quick actions (Re-call / Mark DNC). Writes go straight to
 * Supabase; realtime keeps the table in sync.
 */
export function LeadDrawer({ lead, onClose, demo = false }: { lead: Lead; onClose: () => void; demo?: boolean }) {
  const [stage, setStage] = useState(lead.pipeline_stage ?? "new_lead");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Re-sync when a different lead is opened or realtime updates arrive.
  useEffect(() => {
    setStage(lead.pipeline_stage ?? "new_lead");
    setNotes(lead.notes ?? "");
    setSaved(false);
    setMsg(null);
  }, [lead.id, lead.pipeline_stage, lead.notes]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    if (demo) { setMsg("Demo mode — changes aren't saved."); return; }
    if (!supabase) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("leads")
      .update({ pipeline_stage: stage, notes })
      .eq("id", lead.id);
    setSaving(false);
    if (error) setMsg(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function markDnc() {
    if (demo) { setMsg("Demo mode — changes aren't saved."); return; }
    if (!supabase) return;
    setBusy("dnc");
    const { error } = await supabase
      .from("leads")
      .update({ opted_out: true, pipeline_stage: "dnc" })
      .eq("id", lead.id);
    setBusy(null);
    if (error) setMsg(error.message);
    else {
      setStage("dnc");
      setMsg("Marked do-not-contact.");
    }
  }

  async function reCall() {
    if (demo) { setMsg("Demo mode — no call placed."); return; }
    setBusy("recall");
    setMsg(null);
    const err = await recallLead(lead);
    setBusy(null);
    setMsg(err ?? "Re-call queued — Greece is dialing.");
  }

  const answers = lead.quiz_answers ?? {};
  const answerRows = Object.entries(answers).filter(([, v]) => v != null && v !== "");

  return (
    <>
      <div className="dash-scrim" onClick={onClose} />
      <aside className="dash-drawer" role="dialog" aria-modal="true" aria-label={`Lead: ${fullName(lead)}`}>
        <div className="dash-drawer-top">
          <div>
            <h2>{fullName(lead)}</h2>
            <div className="sub">
              {intentBucket(lead)} · created {fmtDateTime(lead.created_at)}
            </div>
          </div>
          <button className="dash-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="dash-drawer-body">
          {/* Contact */}
          <section>
            <p className="dash-sec-title">Contact</p>
            <dl className="dash-kv">
              <dt>Phone</dt>
              <dd>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}</dd>
              <dt>Email</dt>
              <dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</dd>
              <dt>Priority</dt>
              <dd>{lead.primary_concern_label ?? lead.primary_concern ?? "—"}</dd>
            </dl>
          </section>

          {/* Consent */}
          <section>
            <p className="dash-sec-title">Consent</p>
            <dl className="dash-kv">
              <dt>Call consent</dt>
              <dd>{lead.consent_call ? "Yes" : "No"}{lead.opted_out ? " · opted out" : ""}</dd>
              <dt>Email opt-in</dt>
              <dd>{lead.consent_email ? "Yes" : "No"}</dd>
              <dt>SMS opt-in</dt>
              <dd>{lead.consent_sms ? "Yes" : "No"}</dd>
            </dl>
          </section>

          {/* Call outcome */}
          <section>
            <p className="dash-sec-title">Call</p>
            <dl className="dash-kv">
              <dt>Status</dt>
              <dd>{lead.call_status ?? "—"}</dd>
              <dt>Outcome</dt>
              <dd>{lead.call_outcome ?? "—"}</dd>
              <dt>Appointment</dt>
              <dd>{fmtDateTime(lead.appointment_at)}</dd>
              <dt>Transcript</dt>
              <dd>{lead.transcript_url ? <a href={lead.transcript_url} target="_blank" rel="noreferrer">Open transcript</a> : lead.transcript ? "Inline (see notes)" : "—"}</dd>
              <dt>Recording</dt>
              <dd>{lead.recording_url ? <a href={lead.recording_url} target="_blank" rel="noreferrer">Play recording</a> : "—"}</dd>
            </dl>
          </section>

          {/* Quiz answers */}
          <section>
            <p className="dash-sec-title">Quiz answers</p>
            {answerRows.length === 0 ? (
              <p className="dash-empty">No answers stored.</p>
            ) : (
              <div className="dash-answers">
                {answerRows.map(([k, v]) => (
                  <div className="row" key={k}>
                    <span>{k.replace(/_/g, " ")}</span>
                    <span>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Editable stage + notes */}
          <section style={{ display: "grid", gap: "1rem" }}>
            <div className="dash-field">
              <label htmlFor="stage">Pipeline stage</label>
              <select id="stage" className="dash-select" value={stage} onChange={(e) => setStage(e.target.value)}>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>{STAGE_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="dash-field">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" className="dash-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note about this lead…" />
            </div>
            {msg ? <p className="dash-saved" style={{ color: "var(--muted)" }}>{msg}</p> : null}
          </section>
        </div>

        <div className="dash-drawer-actions">
          <button className="dash-btn dash-btn--primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
          <button className="dash-btn" onClick={reCall} disabled={busy === "recall"}>
            {busy === "recall" ? "Calling…" : "Re-call"}
          </button>
          <button className="dash-btn dash-btn--danger" onClick={markDnc} disabled={busy === "dnc" || lead.opted_out === true}>
            {lead.opted_out ? "On DNC" : "Mark DNC"}
          </button>
        </div>
      </aside>
    </>
  );
}
