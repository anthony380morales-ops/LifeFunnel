# Automation workflow definitions

Client-side hooks live in `src/lib/automationHooks.ts` and `src/lib/analytics.ts`. **Server-side execution** (SMS, email, CRM stages, Instagram DM auto-replies) should be implemented in Zapier, Make, n8n, or your private pipeline consuming the webhook.

## Lead webhook (`VITE_LEAD_WEBHOOK_URL`)

`POST` JSON (`Content-Type: application/json`). Example shape matches `LeadPayload` in `src/types/funnel.ts`.

### Recommended Zapier / Make steps

1. **Catch webhook** → parse JSON.
2. **Branch on `pipeline_stage`** — map to your CRM column or deal stage.
3. **Apply tags** — split `tags` array onto contact record.
4. **Consent gates:**
   - If `consent_sms` → enroll SMS sequence (TCPA-compliant provider).
   - If `consent_email` → enroll email sequence.
   - If neither → internal task only / call queue.
5. **Serious leads** — `intent:high` or `call_intent` → SMS “reply STOP” compliant ping + optional outbound dialer queue.

## Event triggers (conceptual)

| Trigger | Client signal | Suggested automation |
|---------|---------------|---------------------|
| Quiz completion | `quiz_completed` analytics + webhook on form submit | Immediate confirmation SMS/email if consented |
| Call button click | `cta_call_click` | Tag “call intent”; optional callback task if phone captured later |
| Calendar click | `cta_calendar_click` | Tag “calendar”; reminder sequence |
| Missed lead | No submit within 24h of `quiz_started` | Nurture email #1 |
| Incomplete quiz | `quiz_abandoned` / beacon | Recovery SMS/email at 1h, 24h |
| SMS consent | Checkbox on form | Double opt-in if carrier requires |
| Email consent | Checkbox on form | Welcome + recap email |
| Instagram DM keyword (e.g. CLARITY) | Manual ManyChat / Meta → webhook | Same tagging as quiz lead |
| Story reply | Meta inbox → webhook | Tag `source:instagram_story` |
| Retargeting | `retargeting_seed` events | Sync to Meta Custom Audience via offline conversions API or Zap |

## Timing cadence (non-pushy)

- **T+0:** Confirmation (if opted in).
- **T+24h:** Value education + soft CTA to call.
- **T+3d:** Case-style educational piece + quiz link.
- **T+7d:** Single follow-up; move to long nurture if no engagement.

## Instagram DM keyword flow (operations)

1. Pin comment / bio: “DM **CLARITY** for the free check-in.”
2. Automation replies with funnel URL + one-line expectation (“2 minutes, then optional call”).
3. Webhook from DM tool creates CRM row tagged `source:instagram_dm_keyword`.

## Callback / missed-call workflow

Not implemented as telephony in-repo. **Recommended:** cloud PBX (RingCentral, Dialpad, etc.) → missed-call triggers Zap → SMS template: “Thanks for calling NXG — reply YES for a callback window.” Only send if prior SMS consent or transactional exemption applies — verify with counsel.
