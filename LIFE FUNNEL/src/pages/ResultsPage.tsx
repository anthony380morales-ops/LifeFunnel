import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { generateQuizResult, isQuizComplete } from "@/lib/quizLogic";
import type { QuizAnswers } from "@/types/funnel";
import { CallNowButton } from "@/components/CallNowButton";
import { BookStrategyButton } from "@/components/BookStrategyButton";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

function loadCompletedFromStorage(): QuizAnswers | null {
  try {
    const raw = sessionStorage.getItem("nxg_funnel_completed_quiz");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers?: QuizAnswers };
    return parsed.answers ?? null;
  } catch {
    return null;
  }
}

export function ResultsPage() {
  const { answers } = useFunnel();

  const merged = useMemo(() => {
    if (isQuizComplete(answers)) return answers;
    const s = loadCompletedFromStorage();
    return s && isQuizComplete(s) ? s : null;
  }, [answers]);

  if (!merged || !isQuizComplete(merged)) {
    return <Navigate to="/quiz" replace />;
  }

  const result = generateQuizResult(merged);

  return (
    <section className="section container">
      <p className="eyebrow">Your clarity snapshot</p>
      <h1>{result.headline}</h1>
      <p className="lead">
        Below is a plain-language readout based on what you shared — not a prediction of returns or tax outcomes.
        A short strategy review can help translate this into questions worth asking next.
      </p>

      <div className="grid-2" style={{ marginTop: "2rem", alignItems: "stretch" }}>
        <div className="card stack">
          <h2 style={{ marginTop: 0 }}>What you told us</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--muted)" }}>
            {result.summaryBullets.map((line) => (
              <li key={line} style={{ marginBottom: "0.35rem" }}>
                {line}
              </li>
            ))}
            {merged.goals_open ? (
              <li>
                <strong style={{ color: "var(--text)" }}>Your note:</strong> {merged.goals_open}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="card stack">
          <h2 style={{ marginTop: 0 }}>Financial clarity readout</h2>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>{result.clarityParagraph}</p>
          <div>
            <h3 style={{ marginTop: "1rem" }}>Topics worth discussing</h3>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--muted)" }}>
              {result.suggestedTopics.map((t) => (
                <li key={t} style={{ marginBottom: "0.35rem" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className="card stack"
        style={{
          marginTop: "2rem",
          borderColor: "rgba(201, 162, 39, 0.35)",
          background: "linear-gradient(145deg, var(--accent-dim), transparent 55%)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Talk it through — fastest path</h2>
        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
          Speak with a licensed professional about your situation. No cost for this introductory strategy review when
          offered — timing subject to availability.
        </p>
        <CallNowButton />
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "1rem 0 0" }}>
          Prefer to schedule? Use the secondary option below — we still recommend a quick call first when possible.
        </p>
        <div className="stack stack--row-md" style={{ marginTop: "0.5rem" }}>
          <BookStrategyButton />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <LeadCaptureForm answers={merged} />
      </div>

      <p className="footer-note" style={{ marginTop: "2rem" }}>
        Insurance products (including IUL and whole life) are subject to underwriting and policy charges; cash value is
        not guaranteed. Annuities may impose surrender charges and market-sensitive features vary by contract. Tax topics
        discussed are general in nature — consult a qualified tax professional for advice related to your situation.
      </p>

      <p style={{ marginTop: "1rem" }}>
        <Link to="/quiz" state={{ reset: true }}>
          Retake the check-in
        </Link>{" "}
        ·{" "}
        <Link to="/">Return home</Link>
      </p>
    </section>
  );
}
