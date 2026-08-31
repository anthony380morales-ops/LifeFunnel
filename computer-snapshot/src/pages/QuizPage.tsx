import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { getVisibleQuestions, isQuizComplete, QUIZ_QUESTIONS } from "@/lib/quizLogic";
import { trackEvent } from "@/lib/analytics";
import {
  clearPartialQuiz,
  loadPartialQuiz,
  persistPartialQuiz,
  recordSessionStart,
  trackQuizAbandoned,
} from "@/lib/automationHooks";
import type { QuizAnswers } from "@/types/funnel";

export function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, setAnswer, saveCompletedQuiz } = useFunnel();
  const [stepIndex, setStepIndex] = useState(0);
  const startedTracked = useRef(false);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const current = visibleQuestions[stepIndex];

  useEffect(() => {
    if (location.state && typeof location.state === "object" && "reset" in location.state) {
      clearPartialQuiz();
      QUIZ_QUESTIONS.forEach((q) => setAnswer(q.id, undefined));
      setStepIndex(0);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, setAnswer]);

  useEffect(() => {
    recordSessionStart();
    const partial = loadPartialQuiz();
    if (partial?.answers && Object.keys(partial.answers).length > 0) {
      Object.entries(partial.answers).forEach(([k, v]) => {
        setAnswer(k as keyof QuizAnswers, v as never);
      });
      const vis = getVisibleQuestions(partial.answers);
      const idx = Math.min(partial.stepIndex, Math.max(0, vis.length - 1));
      setStepIndex(idx);
    }
  }, [setAnswer]);

  useEffect(() => {
    persistPartialQuiz(answers, stepIndex);
  }, [answers, stepIndex]);

  useEffect(() => {
    if (stepIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
      setStepIndex(visibleQuestions.length - 1);
    }
  }, [stepIndex, visibleQuestions.length]);

  useEffect(() => {
    const onLeave = () => {
      if (!isQuizComplete(answers)) {
        trackQuizAbandoned(answers, stepIndex);
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [answers, stepIndex]);

  const bumpStart = useCallback(() => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      trackEvent("quiz_started", { path: "/quiz" });
    }
  }, []);

  const stableAdvance = useCallback(
    (qid: keyof QuizAnswers, value: string) => {
      bumpStart();
      const combined: QuizAnswers = { ...answers, [qid]: value as never };
      if (qid === "employment" && value === "retired") delete combined.income_range;

      setAnswer(qid, value as never);
      if (qid === "employment" && value === "retired") setAnswer("income_range", undefined);

      trackEvent("quiz_step", { questionId: qid });

      const nextVisible = getVisibleQuestions(combined);
      const curIdx = nextVisible.findIndex((q) => q.id === qid);
      const nextIdx = curIdx + 1;

      window.setTimeout(() => {
        if (nextIdx < nextVisible.length) setStepIndex(nextIdx);
      }, 200);
    },
    [answers, bumpStart, setAnswer],
  );

  const finishQuiz = useCallback(
    (final: QuizAnswers) => {
      if (!isQuizComplete(final)) return;
      saveCompletedQuiz(final);
      clearPartialQuiz();
      trackEvent("quiz_completed", { tags: Object.keys(final) });
      navigate("/results", { replace: true });
    },
    [navigate, saveCompletedQuiz],
  );

  const handleGoalsNext = useCallback(() => {
    bumpStart();
    finishQuiz({ ...answers });
  }, [answers, bumpStart, finishQuiz]);

  const handleGoalsSkip = useCallback(() => {
    bumpStart();
    setAnswer("goals_open", undefined);
    finishQuiz({ ...answers, goals_open: undefined });
  }, [answers, bumpStart, finishQuiz, setAnswer]);

  const handleBack = useCallback(() => {
    setStepIndex((s) => Math.max(0, s - 1));
  }, []);

  if (!current) {
    return (
      <section className="section container">
        <p>Nothing to show.</p>
        <Link to="/">Home</Link>
      </section>
    );
  }

  const progress = Math.round(((stepIndex + 1) / visibleQuestions.length) * 100);

  return (
    <section className="section container" style={{ maxWidth: 640 }}>
      <Link to="/" style={{ fontSize: "0.9rem" }}>
        ← Back to overview
      </Link>
      <p className="eyebrow" style={{ marginTop: "1.5rem" }}>
        Financial clarity check-in · ~2 minutes
      </p>
      <h1 style={{ marginBottom: "0.5rem" }}>{current.title}</h1>
      {current.subtitle ? <p className="lead">{current.subtitle}</p> : null}

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--surface)",
          overflow: "hidden",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--accent)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {current.type === "single" && current.options ? (
        <div className="stack" style={{ gap: "0.65rem" }}>
          {current.options.map((opt) => {
            const selected =
              (answers[current.id as keyof QuizAnswers] as string | undefined) === opt.value;
            return (
              <button
                key={opt.id}
                type="button"
                className={`quiz-option${selected ? " is-selected" : ""}`}
                onClick={() => stableAdvance(current.id, opt.value)}
              >
                <span className="quiz-option__radio" aria-hidden />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {current.type === "text" ? (
        <div className="stack">
          <textarea
            className="input"
            value={(answers.goals_open as string | undefined) ?? ""}
            onChange={(e) => setAnswer("goals_open", e.target.value)}
            placeholder="Optional — e.g., Roth conversions, business exit, caring for parents…"
          />
          <div className="stack stack--row-md">
            <button type="button" className="btn btn--primary" onClick={handleGoalsNext}>
              See my clarity snapshot
            </button>
            <button type="button" className="btn btn--secondary" onClick={handleGoalsSkip}>
              Skip &amp; see snapshot
            </button>
          </div>
        </div>
      ) : null}

      {current.type === "single" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <button type="button" className="btn btn--secondary" onClick={handleBack} disabled={stepIndex === 0}>
            Back
          </button>
        </div>
      ) : null}

      <p className="footer-note" style={{ marginTop: "2rem" }}>
        For educational purposes only — not tax or investment advice. Products subject to underwriting / issuer terms.
      </p>
    </section>
  );
}
