import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { FunnelProvider } from "@/context/FunnelContext";
import { QuizPage } from "@/pages/QuizPage";
import { DetailsPage } from "@/pages/DetailsPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { trackPageView } from "@/lib/analytics";

function AnalyticsRouteLogger() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

export default function App() {
  return (
    <FunnelProvider>
      <BrowserRouter>
        <AnalyticsRouteLogger />
        <Routes>
          {/* Any visit drops straight into the questionnaire. */}
          <Route path="/" element={<QuizPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/details" element={<DetailsPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </FunnelProvider>
  );
}
