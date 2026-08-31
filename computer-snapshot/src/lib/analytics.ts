/**
 * Analytics facade — Meta Pixel / GTM / custom dataLayer.
 * Events align with docs/analytics-schema.md
 */

export type FunnelEventName =
  | "funnel_page_view"
  | "cta_call_click"
  | "cta_calendar_click"
  | "quiz_started"
  | "quiz_step"
  | "quiz_completed"
  | "quiz_abandoned"
  | "lead_capture_submit"
  | "lead_capture_error"
  | "sms_consent_granted"
  | "email_consent_granted"
  | "retargeting_seed";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

function pushDataLayer(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function trackEvent(
  name: FunnelEventName,
  params?: Record<string, unknown>,
): void {
  pushDataLayer({ event: name, ...params });

  if (typeof window.fbq === "function" && import.meta.env.VITE_META_PIXEL_ID) {
    window.fbq("trackCustom", name, params ?? {});
  }

  if (import.meta.env.DEV) {
    console.debug("[analytics]", name, params);
  }
}

export function trackPageView(path: string): void {
  trackEvent("funnel_page_view", { path, ts: Date.now() });
}
