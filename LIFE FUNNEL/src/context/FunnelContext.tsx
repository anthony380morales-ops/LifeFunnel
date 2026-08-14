import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { QuizAnswers } from "@/types/funnel";

const RESULT_KEY = "nxg_funnel_completed_quiz";

interface FunnelContextValue {
  answers: QuizAnswers;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K] | undefined) => void;
  resetQuiz: () => void;
  saveCompletedQuiz: (answers: QuizAnswers) => void;
  loadSavedQuiz: () => QuizAnswers | null;
  clickedCall: boolean;
  setClickedCall: (v: boolean) => void;
  clickedCalendar: boolean;
  setClickedCalendar: (v: boolean) => void;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswers>({});

  /** Hydrate quiz answers after refresh so /results still works */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { answers?: QuizAnswers };
      if (parsed.answers && Object.keys(parsed.answers).length > 0) {
        setAnswers(parsed.answers);
      }
    } catch {
      /* ignore */
    }
  }, []);
  const [clickedCall, setClickedCall] = useState(false);
  const [clickedCalendar, setClickedCalendar] = useState(false);

  const setAnswer = useCallback(<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K] | undefined) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setAnswers({});
  }, []);

  const saveCompletedQuiz = useCallback((a: QuizAnswers) => {
    try {
      sessionStorage.setItem(
        RESULT_KEY,
        JSON.stringify({ answers: a, completedAt: new Date().toISOString() }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const loadSavedQuiz = useCallback((): QuizAnswers | null => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { answers: QuizAnswers };
      return parsed.answers ?? null;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      answers,
      setAnswer,
      resetQuiz,
      saveCompletedQuiz,
      loadSavedQuiz,
      clickedCall,
      setClickedCall,
      clickedCalendar,
      setClickedCalendar,
    }),
    [
      answers,
      setAnswer,
      resetQuiz,
      saveCompletedQuiz,
      loadSavedQuiz,
      clickedCall,
      clickedCalendar,
    ],
  );

  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>;
}

export function useFunnel(): FunnelContextValue {
  const ctx = useContext(FunnelContext);
  if (!ctx) throw new Error("useFunnel must be used within FunnelProvider");
  return ctx;
}
