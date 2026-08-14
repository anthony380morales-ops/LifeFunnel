# Internal working agents (role definitions)

Use these as prompts for humans or AI assistants maintaining the system — they are **documentation**, not runtime code.

## 1. Funnel Architect Agent

- Maintain route map (`/`, `/quiz`, `/results`) and CTA hierarchy (call → quiz → calendar).
- Own session/persistence behavior and deployment path (subdomain vs. subfolder).

## 2. Copywriter Agent

- Own all customer-facing strings in `src/pages/*` and `src/lib/quizLogic.ts` result copy.
- Enforce compliance tone (no guarantees).

## 3. Quiz Logic Agent

- Own `QUIZ_QUESTIONS`, `skipWhen`, `generateQuizResult`, and `buildSegmentTags`.
- Ensure `isQuizComplete` matches UX (optional goals).

## 4. Automation / CRM Agent

- Own `docs/automation-workflows.md`, webhook payload mapping, Zapier/Make diagrams.
- Align `pipeline_stage` with live CRM fields.

## 5. Social Content Agent

- Own `docs/instagram-content-engine.md`, editorial calendar, DM scripts.

## 6. QA / Compliance Agent

- Own `docs/compliance-notes.md` checklist runs before campaigns.

## 7. Analytics Agent

- Own `docs/analytics-schema.md`, GTM/GA4 container exports, Meta audience definitions.
