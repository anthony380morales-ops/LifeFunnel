import { Navigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { isQuizComplete } from "@/lib/quizLogic";
import { CallCountdown } from "@/components/CallCountdown";
import { AboutContent } from "@/site/AboutContent";

/**
 * The company / About page a visitor reads AFTER the questionnaire, while a
 * countdown runs and then Greece calls them.
 *
 * This file is intentionally tiny: the sticky <CallCountdown/> handles the
 * 15-second delay + Greece trigger, and <AboutContent/> (src/site/AboutContent.tsx)
 * is the fully editable page Athena designs. Nothing else needed here.
 */
export function ResultsPage() {
  const { answers, contact } = useFunnel();

  // Must have finished the quiz AND left contact details to reach this page.
  if (!isQuizComplete(answers) || !contact) return <Navigate to="/" replace />;

  return (
    <>
      <CallCountdown />
      <AboutContent />
    </>
  );
}
