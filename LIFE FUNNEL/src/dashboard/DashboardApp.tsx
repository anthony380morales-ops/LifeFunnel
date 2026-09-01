import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseReady } from "@/dashboard/supabase";
import { LoginPage } from "@/dashboard/LoginPage";
import { Dashboard } from "@/dashboard/Dashboard";

/**
 * Auth gate for /dashboard. Shows the login until a Supabase session exists,
 * then the dashboard. If Supabase env isn't set yet, shows a config notice.
 */
export function DashboardApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // `/dashboard?demo` renders the command center with sample data — a
  // credential-free preview before Supabase is wired / real leads exist.
  const demo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");

  useEffect(() => {
    if (demo || !supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [demo]);

  if (demo) return <Dashboard demo />;

  // In a standalone preview build (VITE_PREVIEW) with no Supabase configured,
  // show the demo dashboard instead of the config notice so reviewers can see
  // the command center. Never triggers on a real deploy (flag unset).
  if (import.meta.env.VITE_PREVIEW && !supabaseReady) return <Dashboard demo />;

  if (!supabaseReady) {
    return (
      <section className="section container" style={{ maxWidth: 560 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Dashboard not configured</h1>
          <p style={{ color: "var(--muted)" }}>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Netlify and redeploy. See
            <code> docs/dashboard-backend.md</code>.
          </p>
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="section container">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </section>
    );
  }

  return session ? <Dashboard /> : <LoginPage />;
}
