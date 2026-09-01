import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, type Lead } from "@/dashboard/supabase";

/**
 * STARTER dashboard — a live, realtime leads table + KPIs, wired to Supabase.
 * Athena: this proves the data flow; restyle into the modern-futuristic command
 * center and add the intent/compliance/outreach panels + lead detail view.
 */
export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
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
  }, []);

  const kpis = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isBooked = (l: Lead) => l.pipeline_stage === "booked" || l.call_outcome === "BOOKED";
    return {
      total: leads.length,
      today: leads.filter((l) => new Date(l.created_at) >= startOfToday).length,
      inProgress: leads.filter((l) => ["call_intent", "transferred", "contacted"].includes(l.pipeline_stage ?? "")).length,
      booked: leads.filter(isBooked).length,
      converted: leads.filter((l) => l.pipeline_stage === "converted").length,
    };
  }, [leads]);

  return (
    <main className="section container" style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>NXG Life · Command Center</p>
          <h1 style={{ margin: "0.25rem 0 0" }}>Leads</h1>
        </div>
        <button className="btn btn--secondary" onClick={() => supabase?.auth.signOut()}>Sign out</button>
      </div>

      {/* KPI row */}
      <div className="grid-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        <Kpi label="Total leads" value={kpis.total} />
        <Kpi label="New today" value={kpis.today} />
        <Kpi label="In progress" value={kpis.inProgress} />
        <Kpi label="Booked" value={kpis.booked} />
        <Kpi label="Converted" value={kpis.converted} />
      </div>

      {/* Leads table */}
      <div className="card" style={{ marginTop: "1.5rem", overflowX: "auto" }}>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading leads…</p>
        ) : leads.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No leads yet — submit the funnel to see one appear here live.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <Th>Created</Th><Th>Name</Th><Th>Phone</Th><Th>Priority</Th>
                <Th>Stage</Th><Th>Call</Th><Th>Outcome</Th><Th>Appointment</Th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td>{new Date(l.created_at).toLocaleString()}</Td>
                  <Td>{[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}</Td>
                  <Td>{l.phone ?? "—"}</Td>
                  <Td>{l.primary_concern_label ?? l.primary_concern ?? "—"}</Td>
                  <Td>{l.pipeline_stage ?? "—"}</Td>
                  <Td>{l.call_status ?? "—"}</Td>
                  <Td>{l.call_outcome ?? "—"}</Td>
                  <Td>{l.appointment_at ? new Date(l.appointment_at).toLocaleString() : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th style={{ padding: "0.5rem 0.6rem", fontWeight: 600 }}>{children}</th>;
}
function Td({ children }: { children: ReactNode }) {
  return <td style={{ padding: "0.5rem 0.6rem", color: "var(--text)" }}>{children}</td>;
}
