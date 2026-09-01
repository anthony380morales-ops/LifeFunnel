import { useState, type FormEvent } from "react";
import { supabase } from "@/dashboard/supabase";

/**
 * STARTER — Athena: restyle freely into the NXG "Admin Portal" login.
 * Auth is Supabase email/password. Create the admin user in Supabase →
 * Authentication → Users → Add user.
 */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
    // On success, DashboardApp's auth listener swaps to the dashboard.
  }

  return (
    <section
      className="section container"
      style={{ maxWidth: 420, minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <form className="card stack" onSubmit={onSubmit} style={{ width: "100%" }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>NXG Life · Admin Portal</p>
        <h1 style={{ textAlign: "center", marginTop: 0 }}>Welcome back</h1>

        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Email</span>
          <input
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>
        <label className="stack" style={{ gap: "0.35rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        {error ? (
          <p role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
        ) : null}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="footer-note" style={{ textAlign: "center", margin: 0 }}>
          NXG Life Group · CA License #4490102
        </p>
      </form>
    </section>
  );
}

const inputStyle = {
  minHeight: "var(--tap-min)",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "rgba(15,23,42,0.65)",
  color: "var(--text)",
  padding: "0 1rem",
  fontSize: "1rem",
} as const;
