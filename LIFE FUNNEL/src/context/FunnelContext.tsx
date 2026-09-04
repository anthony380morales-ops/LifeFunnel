import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeadContact, QuizAnswers } from "@/types/funnel";

// Persisted in localStorage (not sessionStorage) so a device that has already
// completed the funnel is remembered across refreshes, new tabs, and return
// visits — the visitor skips the quiz and drops straight into the portfolio.
const RESULT_KEY = "nxg_funnel_completed_quiz";
const CONTACT_KEY = "nxg_funnel_contact";

/**
 * Device memory: read a previously completed funnel (quiz answers + contact)
 * from localStorage. Returns null if this device has never finished the funnel.
 * Used to route returning visitors past the quiz.
 */
export function readFunnelMemory(): { answers: QuizAnswers; contact: LeadContact } | null {
  try {
    const rawResult = localStorage.getItem(RESULT_KEY);
    const rawContact = localStorage.getItem(CONTACT_KEY);
    if (!rawResult || !rawContact) return null;
    const answers = (JSON.parse(rawResult) as { answers?: QuizAnswers }).answers;
    const contact = JSON.parse(rawContact) as LeadContact;
    if (!answers || Object.keys(answers).length === 0 || !contact?.phone) return null;
    return { answers, contact };
  } catch {
    return null;
  }
}

/** Forget this device (used by an explicit "retake the quiz" reset). Also
 *  clears the call-fired guard so a genuine retake can place a fresh call. */
export function clearFunnelMemory(): void {
  try {
    localStorage.removeItem(RESULT_KEY);
    localStorage.removeItem(CONTACT_KEY);
    localStorage.removeItem("nxg_funnel_call_fired");
  } catch {
    /* ignore */
  }
}

interface FunnelContextValue {
  answers: QuizAnswers;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K] | undefined) => void;
  resetQuiz: () => void;
  saveCompletedQuiz: (answers: QuizAnswers) => void;
  loadSavedQuiz: () => QuizAnswers | null;
  /** Contact details captured on /details; drives the Greece callback. */
  contact: LeadContact | null;
  setContact: (c: LeadContact) => void;
  clickedCall: boolean;
  setClickedCall: (v: boolean) => void;
  clickedCalendar: boolean;
  setClickedCalendar: (v: boolean) => void;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function FunnelProvider({ children }: { children: ReactNode }) {
  // Hydrate synchronously from device memory so returning visitors land on
  // /results without a render gap that would bounce them back to the quiz.
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      const parsed = raw ? (JSON.parse(raw) as { answers?: QuizAnswers }) : null;
      if (parsed?.answers && Object.keys(parsed.answers).length > 0) return parsed.answers;
    } catch {
      /* ignore */
    }
    return {};
  });
  const [clickedCall, setClickedCall] = useState(false);
  const [clickedCalendar, setClickedCalendar] = useState(false);

  const [contact, setContactState] = useState<LeadContact | null>(() => {
    try {
      const raw = localStorage.getItem(CONTACT_KEY);
      if (raw) return JSON.parse(raw) as LeadContact;
    } catch {
      /* ignore */
    }
    return null;
  });

  const setContact = useCallback((c: LeadContact) => {
    setContactState(c);
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
  }, []);

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
      localStorage.setItem(
        RESULT_KEY,
        JSON.stringify({ answers: a, completedAt: new Date().toISOString() }),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const loadSavedQuiz = useCallback((): QuizAnswers | null => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
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
      contact,
      setContact,
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
      contact,
      setContact,
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
