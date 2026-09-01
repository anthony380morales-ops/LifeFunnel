import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { FunnelProvider } from "@/context/FunnelContext";
import { QuizPage } from "@/pages/QuizPage";
import { DetailsPage } from "@/pages/DetailsPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { trackPageView } from "@/lib/analytics";

// Lazy-loaded so Supabase only downloads on /dashboard, keeping the funnel light.
const DashboardApp = lazy(() =>
  import("@/dashboard/DashboardApp").then((m) => ({ default: m.DashboardApp })),
);

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
          {/* Private admin — reached by direct URL, gated by Supabase Auth. */}
          <Route
            path="/dashboard/*"
            element={
              <Suspense fallback={<div className="section container" style={{ color: "var(--muted)" }}>Loading…</div>}>
                <DashboardApp />
              </Suspense>
            }
          />
          {/* Any unknown URL drops into the questionnaire — the mandatory entry gate. */}
          <Route path="*" element={<QuizPage />} />
        </Routes>
      </BrowserRouter>
    </FunnelProvider>
  );
}
