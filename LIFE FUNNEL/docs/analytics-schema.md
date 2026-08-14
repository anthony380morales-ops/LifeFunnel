# Analytics event schema

Events push to `window.dataLayer` as `{ event: string, ...params }`. Optional Meta Pixel: set `VITE_META_PIXEL_ID` and load Pixel script in `index.html`; `window.fbq('trackCustom', …)` is invoked when Pixel is present.

## Standard events

| Event name | When fired | Key params |
|------------|------------|------------|
| `funnel_page_view` | Route change | `path`, `ts` |
| `cta_call_click` | Tel link clicked | `label` (display phone) |
| `cta_calendar_click` | Calendar link clicked | `url` |
| `quiz_started` | First quiz interaction | `path` |
| `quiz_step` | Each answered step | `questionId` |
| `quiz_completed` | Quiz finished | `tags` |
| `quiz_abandoned` | Incomplete unload | `stepIndex`, `partialKeys` |
| `lead_capture_submit` | Form submitted | `pipeline_stage`, `tags` |
| `lead_capture_error` | Webhook failure | `reason` / `status` |
| `sms_consent_granted` | After successful submit | `granted` |
| `email_consent_granted` | After successful submit | `granted` |
| `retargeting_seed` | Call/calendar click | `audience` |

## Dashboard outputs (recommended)

- **Landing → Quiz start rate:** `quiz_started` / `funnel_page_view` on `/`.
- **Quiz completion rate:** `quiz_completed` / `quiz_started`.
- **Call intent rate:** `cta_call_click` / `funnel_page_view` on `/` or `/results`.
- **Lead capture rate:** `lead_capture_submit` / `quiz_completed`.
- **Drop-off by step:** Count `quiz_step` by `questionId` sequence.

## GTM container

Add triggers on Custom Event names above; map to GA4 recommended events where applicable (`generate_lead`, `contact`).

## Meta / retargeting

Use `retargeting_seed` + CAPI offline conversions for audiences “call_clickers” and “calendar_clickers” — ensure consent policy alignment for EU/CA traffic if applicable.
