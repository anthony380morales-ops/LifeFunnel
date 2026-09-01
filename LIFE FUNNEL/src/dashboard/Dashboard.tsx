import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, type Lead } from "@/dashboard/supabase";
import { siteConfig } from "@/site/siteConfig";
import { LeadDrawer } from "@/dashboard/LeadDrawer";
import { DEMO_LEADS } from "@/dashboard/demoLeads";
import {
  callWindow,
  fmtDateTime,
  fullName,
  intentBucket,
  isAwaitingAction,
  STAGE_LABEL,
} from "@/dashboard/leadHelpers";
import "@/dashboard/dashboard.css";

/**
 * NXG Life · Command Center — a realtime, glassmorphic admin dashboard over the
 * Supabase `leads` table: KPIs, intent distribution, compliance, an outreach
 * queue, a TCPA quiet-hours badge, and a recent-leads table that opens a full
 * lead-detail drawer (editable stage + notes, Re-call / Mark DNC).
 */
export function Dashboard({ demo = false }: { demo?: boolean } = {}) {
  const [leads, setLeads] = useState<Lead[]>(demo ? DEMO_LEADS : []);
  const [loading, setLoading] = useState(!demo);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  // Tick each minute so the TCPA window badge stays accurate.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (demo || !supabase) return;
    let active = true;

    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setLeads((data as Lead[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        setLeads((prev) => {
          if (payload.eventType === "DELETE") {
            return prev.filter((l) => l.id !== (payload.old as Lead).id);
          }
          const row = payload.new as Lead;
          const idx = prev.findIndex((l) => l.id === row.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = row;
            return next;
          }
          return [row, ...prev];
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase!.removeChannel(channel);
    };
  }, [demo]);

  const kpis = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isBooked = (l: Lead) => l.pipeline_stage === "booked" || l.call_outcome === "BOOKED";
    return {
      total: leads.length,
      today: leads.filter((l) => new Date(l.created_at) >= startOfToday).length,
      inProgress: leads.filter((l) =>
        ["call_intent", "transferred", "contacted"].includes(l.pipeline_stage ?? ""),
      ).length,
      booked: leads.filter(isBooked).length,
      converted: leads.filter((l) => l.pipeline_stage === "converted").length,
    };
  }, [leads]);

  const intent = useMemo(() => {
    const buckets = { Protection: 0, Retirement: 0, IBC: 0, Other: 0 } as Record<string, number>;
    leads.forEach((l) => { buckets[intentBucket(l)] += 1; });
    return buckets;
  }, [leads]);

  const compliance = useMemo(() => {
    const dnc = leads.filter((l) => l.opted_out).length;
    const optedIn = leads.filter((l) => l.consent_call && !l.opted_out).length;
    const optedOut = leads.filter((l) => !l.consent_call && !l.opted_out).length;
    return { optedIn, optedOut, dnc };
  }, [leads]);

  const queue = useMemo(() => leads.filter(isAwaitingAction).slice(0, 12), [leads]);
  const win = useMemo(() => callWindow("America/Los_Angeles", now), [now]);
  const selected = useMemo(() => leads.find((l) => l.id === selectedId) ?? null, [leads, selectedId]);

  const intentMax = Math.max(1, ...Object.values(intent));
  const intentColor: Record<string, string> = { Protection: "", Retirement: "blue", IBC: "green", Other: "slate" };

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="dash-brand">
          {siteConfig.logoSrc ? <img src={siteConfig.logoSrc} alt="" /> : null}
          <div>
            <small>Command Center</small>
            <b>{siteConfig.companyName}</b>
          </div>
        </div>
        <div className="dash-top-right">
          <span className={`dash-window ${win.open ? "is-open" : "is-quiet"}`} title="TCPA calling window (8am–9pm PT)">
            <span className="dot" /> {win.label}
          </span>
          <button className="dash-btn" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <div className="dash-wrap">
        {/* KPI row */}
        <div className="dash-kpis">
          <Kpi n={kpis.total} l="Total leads" />
          <Kpi n={kpis.today} l="New today" accent />
          <Kpi n={kpis.inProgress} l="In progress" />
          <Kpi n={kpis.booked} l="Booked" />
          <Kpi n={kpis.converted} l="Converted" />
        </div>

        {/* Panels */}
        <div className="dash-panels">
          <div className="dash-panel">
            <h3>Intent distribution <span className="muted">{leads.length} leads</span></h3>
            {(["Protection", "Retirement", "IBC", "Other"] as const).map((k) => (
              <div className="dash-bar" key={k}>
                <div className="dash-bar-top"><span>{k}</span><span className="c">{intent[k]}</span></div>
                <div className="dash-bar-track">
                  <div className={`dash-bar-fill ${intentColor[k]}`} style={{ width: `${(intent[k] / intentMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="dash-panel">
            <h3>Compliance status</h3>
            <div className="dash-pills">
              <div className="dash-pill"><span className="k"><span className="dot green" /> Opted-in</span><span className="v">{compliance.optedIn}</span></div>
              <div className="dash-pill"><span className="k"><span className="dot amber" /> No call consent</span><span className="v">{compliance.optedOut}</span></div>
              <div className="dash-pill"><span className="k"><span className="dot red" /> Do-not-contact</span><span className="v">{compliance.dnc}</span></div>
            </div>
          </div>

          <div className="dash-panel">
            <h3>Outreach queue <span className="muted">{queue.length} awaiting</span></h3>
            {queue.length === 0 ? (
              <p className="dash-empty">Nothing waiting — you're all caught up.</p>
            ) : (
              <div className="dash-queue">
                {queue.map((l) => (
                  <div className="dash-queue-row" key={l.id} onClick={() => setSelectedId(l.id)}>
                    <div>
                      <div className="who">{fullName(l)}</div>
                      <div className="sub">{l.primary_concern_label ?? intentBucket(l)} · {l.phone ?? "no phone"}</div>
                    </div>
                    <StageBadge stage={l.call_status ? l.call_status : l.pipeline_stage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent leads table */}
        <div className="dash-head">
          <p className="eyebrow">Live feed</p>
          <h2>Recent leads</h2>
        </div>
        <div className="dash-tablewrap">
          {loading ? (
            <p className="dash-empty" style={{ padding: "1.25rem" }}>Loading leads…</p>
          ) : leads.length === 0 ? (
            <p className="dash-empty" style={{ padding: "1.25rem" }}>No leads yet — complete the funnel to see one appear here live.</p>
          ) : (
            <div className="dash-tablescroll">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Created</th><th>Name</th><th>Phone</th><th>Priority</th>
                    <th>Stage</th><th>Call</th><th>Outcome</th><th>Appointment</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} onClick={() => setSelectedId(l.id)}>
                      <td className="dash-num">{fmtDateTime(l.created_at)}</td>
                      <td>{fullName(l)}</td>
                      <td className="dash-num">{l.phone ?? "—"}</td>
                      <td>{l.primary_concern_label ?? l.primary_concern ?? "—"}</td>
                      <td><StageBadge stage={l.pipeline_stage} /></td>
                      <td>{l.call_status ?? "—"}</td>
                      <td>{l.call_outcome ?? "—"}</td>
                      <td className="dash-num">{l.appointment_at ? fmtDateTime(l.appointment_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected ? <LeadDrawer lead={selected} demo={demo} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function Kpi({ n, l, accent = false }: { n: number; l: string; accent?: boolean }) {
  return (
    <div className={`dash-kpi${accent ? " is-accent" : ""}`}>
      <div className="n">{n}</div>
      <div className="l">{l}</div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string | null }): ReactNode {
  const s = stage ?? "new_lead";
  return <span className={`dash-badge stage-${s}`}>{STAGE_LABEL[s] ?? s}</span>;
}
