# Funnel architecture — NXG Life Group (hybrid authority)

## Repository inspection summary

The workspace did not contain an existing web codebase. This funnel is implemented as a **standalone Vite + React + TypeScript SPA** that can be deployed as a **subpath or subdomain** (for example `nxglifegroup.com/clarity` behind reverse-proxy rewrite, or `clarity.nxglifegroup.com`). Integrate with nxglifegroup.com via navigation links and matching brand CSS when ready.

## User journey (target flow)

1. **Traffic** — Instagram / Meta ads / retargeting → dedicated funnel URL (fast mobile landing).
2. **Landing** (`/`) — Call-first hero, authority framing, optional video embed, quiz CTA, secondary calendar CTA.
3. **Quiz pre-frame** (`/quiz`) — 7-step interactive check-in; conditional skip of income question when employment = retired.
4. **Results** (`/results`) — Personalized “financial clarity” snapshot (no promises), call-first CTA, calendar secondary, lead capture with SMS/email consent.
5. **Automation** — Webhook POST (`VITE_LEAD_WEBHOOK_URL`) + optional `navigator.sendBeacon` duplicate for abandon/incomplete (same URL).
6. **CRM** — Pipeline stage + tags on payload (see `docs/crm-pipeline.md`).
7. **Follow-up** — Defined in `docs/automation-workflows.md` and sequence files.

## CTA hierarchy

| Priority | Element | Route / behavior |
|----------|---------|------------------|
| 1 | Call Now | `tel:` link from `VITE_BUSINESS_PHONE` |
| 2 | Start quiz | `/quiz` |
| 3 | Book strategy session | `VITE_CALENDAR_URL` (new tab) |

## Conditional quiz logic

- **Retired branch:** If “Retired / other” is selected for employment, the income-range question is skipped (`skipWhen` in `src/lib/quizLogic.ts`).
- **Goals:** Final question is optional text; users may skip and still complete the quiz.

## State & persistence

- **Session:** Partial quiz progress — `sessionStorage` key via `persistPartialQuiz` (`nxg_funnel_quiz`).
- **Completed quiz:** `nxg_funnel_completed_quiz` — hydrates results after refresh.

## Scaling / modularity

- Add offers: duplicate route group under `/offers/:slug` with shared components (`CallNowButton`, `LeadCaptureForm`).
- Copy variants: extract strings to `src/content/` if localization or A/B tests are needed.
