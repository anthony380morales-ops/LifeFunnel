import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFunnel, readFunnelMemory, clearFunnelMemory } from "@/context/FunnelContext";
import { getVisibleQuestions, isQuizComplete, QUIZ_QUESTIONS } from "@/lib/quizLogic";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/site/siteConfig";
import {
  clearPartialQuiz,
  loadPartialQuiz,
  persistPartialQuiz,
  recordSessionStart,
  trackQuizAbandoned,
} from "@/lib/automationHooks";
import type { QuizAnswers } from "@/types/funnel";
import "@/site/quiz.css";

export function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, setAnswer, saveCompletedQuiz } = useFunnel();
  const [stepIndex, setStepIndex] = useState(0);
  const startedTracked = useRef(false);

  // Device memory: if this device already completed the funnel, skip the quiz
  // and drop straight into the portfolio — unless an explicit retake was asked
  // for (navigated here with { reset: true }).
  const resetRequested =
    !!location.state && typeof location.state === "object" && "reset" in location.state;
  const [remembered] = useState(() => !resetRequested && readFunnelMemory() != null);
  useEffect(() => {
    if (remembered) navigate("/results", { replace: true });
  }, [remembered, navigate]);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const current = visibleQuestions[stepIndex];

  useEffect(() => {
    if (location.state && typeof location.state === "object" && "reset" in location.state) {
      clearPartialQuiz();
      clearFunnelMemory();
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
      navigate("/details", { replace: true });
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

  // Remembered device — render nothing while the redirect to /results runs.
  if (remembered) return null;

  if (!current) {
    return (
      <div className="nxq">
        <div className="nxq-shell nxq-card">
          <p>Nothing to show.</p>
          <Link to="/">Home</Link>
        </div>
      </div>
    );
  }

  const progress = Math.round(((stepIndex + 1) / visibleQuestions.length) * 100);

  return (
    <div className="nxq">
      <div className="nxq-shell">
        <header className="nxq-top">
          <span className="nxq-brand">
            {siteConfig.logoSrc ? (
              <img className="nxq-logo" src={siteConfig.logoSrc} alt={`${siteConfig.companyName} logo`} />
            ) : null}
            {siteConfig.companyName}
          </span>
          <span className="nxq-step">Question {stepIndex + 1} of {visibleQuestions.length}</span>
        </header>

        <div
          className="nxq-progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="nxq-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* keyed by question id → the card + options re-animate on each step */}
        <div className="nxq-card" key={current.id}>
          <p className="nxq-eyebrow">Financial clarity check-in · ~2 minutes</p>
          <h1 className="nxq-title">{current.title}</h1>
          {current.subtitle ? <p className="nxq-sub">{current.subtitle}</p> : null}

          {current.type === "single" && current.options ? (
            <div className="nxq-opts">
              {current.options.map((opt, i) => {
                const selected =
                  (answers[current.id as keyof QuizAnswers] as string | undefined) === opt.value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`nxq-opt${selected ? " is-selected" : ""}`}
                    style={{ ["--i"]: i } as CSSProperties}
                    onClick={() => stableAdvance(current.id, opt.value)}
                  >
                    <span className="nxq-opt__dot" aria-hidden />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {current.type === "text" ? (
            <>
              <textarea
                className="nxq-textarea"
                value={(answers.goals_open as string | undefined) ?? ""}
                onChange={(e) => setAnswer("goals_open", e.target.value)}
                placeholder="Optional — e.g., Roth conversions, business exit, caring for parents…"
              />
              <div className="nxq-actions">
                <button type="button" className="nxq-btn nxq-btn--primary" onClick={handleGoalsNext}>
                  Continue →
                </button>
                <button type="button" className="nxq-btn nxq-btn--ghost" onClick={handleGoalsSkip}>
                  Skip
                </button>
              </div>
            </>
          ) : null}

          {current.type === "single" ? (
            <div className="nxq-back">
              <button
                type="button"
                className="nxq-btn nxq-btn--ghost"
                onClick={handleBack}
                disabled={stepIndex === 0}
              >
                ← Back
              </button>
            </div>
          ) : null}
        </div>

        <p className="nxq-legal">
          For educational purposes only — not tax or investment advice. Products subject to underwriting / issuer terms.
        </p>
      </div>
    </div>
  );
}
