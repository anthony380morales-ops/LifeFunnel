# NXG Life Group — hybrid authority funnel (call-first)

Production-ready, **mobile-first** marketing funnel: landing → short quiz → personalized results → **call-first CTA** with **calendar as secondary** → lead capture (SMS/email consent) → webhook for CRM/automation.

**Stack:** Vite 5, React 18, TypeScript, React Router 6. Styling: custom CSS variables (`src/styles/global.css`) — no Tailwind dependency.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set phone, calendar URL, webhook
npm run dev
```

Open `http://localhost:5173`

## Build & preview

```bash
npm run build
npm run preview
```

Output in `dist/`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_BUSINESS_PHONE` | Shown on CTAs; used in `tel:` links (E.164 or common US formats). |
| `VITE_CALENDAR_URL` | Secondary “Book a strategy session” button. |
| `VITE_LEAD_WEBHOOK_URL` | POST JSON leads (`LeadPayload`). Zapier/Make/n8n catch hook works well. |
| `VITE_SITE_URL` | Canonical URL for future meta/link expansion. |

See `.env.example`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing: hero, call CTA, quiz CTA, calendar secondary, trust/FAQ/compliance. |
| `/quiz` | 7-step quiz; retired employment skips income question. |
| `/results` | Snapshot + call + calendar + lead form. |

## Deploying

- **Static host (Netlify, Vercel, Cloudflare Pages):** Upload `dist/`; SPA fallback is configured via `public/_redirects` (Netlify). For Vercel, add a rewrite to `index.html` for client-side routes.
- **Subpath:** Build with `base` in `vite.config.ts` if hosting under `nxglifegroup.com/clarity/` (see Vite `base` option).
- **nxglifegroup.com:** Link prominently from main nav or hero banner (“Free clarity check-in”) to this funnel URL.

## Documentation index

- `docs/funnel-architecture.md` — flow & decisions  
- `docs/automation-workflows.md` — Zapier-style automation  
- `docs/analytics-schema.md` — `dataLayer` events  
- `docs/crm-pipeline.md` — stages & tags  
- `docs/compliance-notes.md` — QA / compliance checklist  
- `docs/sequences-email-sms.md` — draft sequences  
- `docs/instagram-content-engine.md` — social pillars  
- `docs/instagram-dm-flow.md` — DM keyword flow  
- `docs/internal-agents.md` — role splits for your team  
- `config/samples/lead-payload.example.json` — webhook sample  

## Connecting CRM later

1. Point `VITE_LEAD_WEBHOOK_URL` at your automation tool.
2. Map JSON fields to deal stages (see `pipeline_stage` and `tags[]`).
3. Optional: implement `LeadDestination` (`src/lib/integrations/LeadDestination.ts`) and swap `submitLead` internals.

## Compliance

Educational positioning only — no guaranteed returns or tax outcomes in UI copy. Review SMS/email with counsel before scaling (`docs/compliance-notes.md`).
