import type { LeadPayload } from "@/types/funnel";

/**
 * Implement in your app when you outgrow a single webhook (e.g. direct CRM API, SQS, gRPC).
 * Current default path: `submitLead` in `src/lib/leadSubmission.ts` uses `fetch` to `VITE_LEAD_WEBHOOK_URL`.
 */
export interface LeadDestination {
  sendLead(payload: LeadPayload): Promise<{ ok: boolean; error?: string }>;
}
