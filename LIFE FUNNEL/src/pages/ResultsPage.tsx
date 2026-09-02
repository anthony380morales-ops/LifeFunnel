import { Navigate } from "react-router-dom";
import { useFunnel } from "@/context/FunnelContext";
import { isQuizComplete } from "@/lib/quizLogic";
import { CallTrigger } from "@/components/CallTrigger";
import { PortfolioContent } from "@/site/PortfolioContent";

/**
 * The company / About page a visitor reads AFTER the questionnaire. A silent
 * <CallTrigger/> places the Greece call in the background after the configured
 * delay (siteConfig.callDelaySeconds) — no countdown, nothing shown. The visitor
 * just reads <AboutContent/> (Athena's page) and their phone rings.
 */
export function ResultsPage() {
  const { answers, contact } = useFunnel();

  if (!isQuizComplete(answers) || !contact) return <Navigate to="/" replace />;

  return (
    <>
      <CallTrigger />
      <PortfolioContent />
    </>
  );
}
