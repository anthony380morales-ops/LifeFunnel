# CRM pipeline structure

Stages are defined in `src/lib/crm.ts` as the `PipelineStage` union.

## Stages (canonical order)

1. **new_lead** — Unknown origin; minimal data.
2. **quiz_started** — Started quiz (analytics); optional if you sync partial progress via beacon.
3. **quiz_completed** — All required answers present (see `isQuizComplete` in `src/lib/quizLogic.ts`).
4. **call_intent** — Clicked `tel:` CTA (tracked client-side; confirm on call).
5. **booked_call** — Clicked calendar scheduling link.
6. **call_completed** — Rep logged conversation.
7. **follow_up_needed** — Open tasks / documents outstanding.
8. **closed_won** — Business outcome recorded (internal definition).
9. **closed_lost** — Not a fit / opted out.
10. **nurture** — Long-term educational track.
11. **referral_source** — Tag-only stage for partner/referral attribution rows.

## Tag format (from quiz)

Pipe-delivered tags include prefixes:

- `income:*`, `work:*`, `coverage:*`, `focus:*`, `assets:*`, `timeline:*`
- `segment:business` — Business owner or mixed.
- `intent:high` — Timeline 30 or 90 days.
- `intent:nurture` — Exploring.

## Stage resolution in code

`stageFromSignals()` picks the **most advanced** applicable stage when submitting the lead form: booked calendar overrides call intent, etc.

## Import to your private DB

Map webhook JSON to your tables; keep raw `answers` JSON for auditability.
