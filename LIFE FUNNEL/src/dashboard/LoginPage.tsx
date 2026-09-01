import { useState, type FormEvent } from "react";
import { supabase } from "@/dashboard/supabase";
import { siteConfig } from "@/site/siteConfig";
import "@/dashboard/dashboard.css";

/**
 * NXG Life · Admin Portal login. Supabase email/password auth. Create the admin
 * user in Supabase → Authentication → Users → Add user.
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
    <div className="dash-login">
      <form className="dash-login-card" onSubmit={onSubmit}>
        {siteConfig.logoSrc ? <img className="logo" src={siteConfig.logoSrc} alt={`${siteConfig.companyName} logo`} /> : null}
        <p className="eyebrow">{siteConfig.companyName} · Admin Portal</p>
        <h1>Welcome back</h1>

        <div className="dash-login-form">
          <div className="dash-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="dash-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="dash-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="dash-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p role="alert" style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p> : null}

          <button type="submit" className="dash-btn dash-btn--primary" disabled={loading} style={{ minHeight: 48 }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <p className="dash-login-foot">NXG Life Group · CA License #{siteConfig.advisor.license}</p>
      </form>
    </div>
  );
}
