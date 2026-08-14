# Compliance & QA notes (California / financial services)

## Language standards used in the funnel

- **No** guaranteed returns, tax outcomes, or specific performance.
- **No** false urgency (no countdown timers, no “slots almost gone” unless factually true and provable).
- **Educational** framing: IUL, whole life, term, annuities, “infinite banking” concepts are described as **topics for discussion**; suitability and underwriting always apply.
- **Tax** references are **general**; individual tax advice requires a qualified tax professional.
- **Insurance:** Cash value, dividends, and index-linked crediting are **not guaranteed** — policy charges and limitations apply; users see a short product-agnostic disclaimer on results.

## Consent (TCPA / email)

- SMS consent checkbox includes **message frequency**, **data rates**, **STOP** language, and that consent is **not a condition of purchase** (see form copy). Review with telephony counsel before scaling SMS.
- Email consent: unsubscribe language included; align with CAN-SPAM and your ESP terms.
- California: CPRA notice referenced in form footer — link the full privacy policy when available.

## Recordkeeping

- Store submitted `answers`, consents, and timestamp in your CRM for audit.

## QA checklist before launch

- [ ] All `tel:` links dial the correct number on iOS and Android.
- [ ] Calendar link opens in new tab and matches production booking resource.
- [ ] Webhook receives test POST (Zapier request inspector).
- [ ] Quiz: retired path skips income; results still generate.
- [ ] Results: refresh page still shows snapshot (session storage).
- [ ] Form: cannot submit without phone or email; consents required per channel.
- [ ] No broken anchors; Lighthouse mobile performance pass (aim for strong LCP on mid-tier devices).

## Known gaps (non-blocking)

- Video embed is placeholder — replace with production iframe.
- Testimonials are placeholders — swap with compliant, documented claims (avoid unsubstantiated superlatives).
