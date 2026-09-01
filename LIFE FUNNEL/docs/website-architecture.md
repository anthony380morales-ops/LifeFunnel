# NXG Life Group — Website + Dashboard Build Spec (for Athena)

**Author:** system architecture · **Build owner:** Athena (design/build agent)
**Status:** ready to build · **Brand:** NXG Life Group (California)

This is the architecture and build brief for the new public website **and** a new
private admin dashboard. The **funnel + AI-caller "Greece" + Cal.com booking are
already built and working** — do not rebuild them. Your job is the presentation
(website) and a brand-new dashboard, wired to the contracts below.

You have creative freedom on layout and visuals ("award-winning, unique") **within
the brand system** in §2. The public site is elegant/luxury-fintech; the dashboard
is modern-futuristic tech.

---

## 1. System overview

```
                         PUBLIC WEBSITE (this build)
   ┌───────────────────────────────────────────────────────────────┐
   │  Homepage (hero, services, About/bio, disclosures)             │
   │        │  "Get Started" →                                      │
   │  Questionnaire (quiz)  →  Contact (name/email/phone/consent)   │
   └─────────────────────────────┬─────────────────────────────────┘
                                 │  on submit
                                 ▼
        POST /.netlify/functions/trigger-retell-call   (ALREADY BUILT)
                                 │
             ┌───────────────────┼─────────────────────┐
             ▼                   ▼                     ▼
     Greece calls the      writes lead to        (optional) forwards
     client in ~15s        Supabase (NEW)        to any webhook
     → warm-transfers                                   
     to Anthony;                                        
     books Cal.com                                      
     if no answer                                       

                         PRIVATE DASHBOARD (this build)
   ┌───────────────────────────────────────────────────────────────┐
   │  Login (Supabase Auth) → Command-center dashboard reading the  │
   │  leads table in realtime: KPIs, intent, compliance, outreach,  │
   │  recent leads + lead detail (quiz, transcript, appt, actions)  │
   └───────────────────────────────────────────────────────────────┘
```

**Two apps, one brand, one data store (Supabase).** Public site is unauthenticated;
dashboard is auth-gated to Anthony.

---

## 2. Brand & design system

Keep the existing color identity (deep navy + gold), evolve the layouts.

**Colors (from the current brand):**
- Ink / background: `#0A0E17` → `#0F172A` (near-black navy, use gradients/darkening)
- Surface / cards: `#141B2D` / `rgba(15,23,42,.65)` with subtle borders `#243049`
- **Gold accent:** `#C9A227` core, `#D4AF37` bright, gold gradient for the shield/CTAs
- Text: `#E8EAF0` primary, `#94A3B8` muted
- States: success `#3FBF7F`, danger `#E5484D`

**Type:**
- Display / headlines: elegant serif (current: **Instrument Serif**) — e.g. "Turning Uncertainty Into Certainty"
- Body / UI: clean sans (current: **DM Sans**)
- Dashboard may use a more technical sans (e.g. Inter / Space Grotesk) for a futuristic feel — your call.

**Logo:** the gold NXG shield (user will drop `logo.svg`/`png` into `public/`).
**Voice / tagline:** "Turning uncertainty into certainty — because it's not just life insurance, it's assurance."

**Public site vibe:** premium, trustworthy, calm luxury fintech. Cinematic hero, generous spacing, gold accents, real family imagery.
**Dashboard vibe:** modern-futuristic command center — glassmorphism/neon-gold data viz, live tickers, dense but legible, dark.

---

## 3. Public website spec

### 3.1 Routes
| Path | Page |
|------|------|
| `/` | Homepage (hero + sections below) |
| `/start` (or a section anchor) | Questionnaire (the quiz) — the "Get Started" CTA target |
| `/details` | Contact capture (already built) |
| `/results` | Post-submit page the visitor reads while Greece calls them (already wired; silent) |
| `/dashboard/*` | Private app (see §4) |

> Note: an earlier iteration made `/` the quiz directly. This spec supersedes that —
> **`/` is the full homepage; the quiz is reached via "Get Started."** The funnel
> components already exist and can be embedded or linked.

### 3.2 Homepage sections (rebuild the old one, better)
1. **Nav:** logo, Services, About, Contact, and a **Dashboard** button (→ `/dashboard` login).
2. **Hero:** cinematic family image, eyebrow ("Powered by NXG Life Group"), serif headline "Turning Uncertainty Into Certainty," subhead, primary CTA **"Get Started"** (→ quiz), secondary "Learn More."
3. **What we do / Services:** Protection (term/whole/IUL/final expense), Retirement (annuities/rollovers/income), Infinite Banking / legacy, tax-aware strategies. Cards or an interactive layout.
4. **About Anthony (bio):** waist-up photo (user provides `anthony.jpg` → `public/`), short bio, and these facts displayed prominently:
   - **Name:** Anthony Morales
   - **License #:** 4490102
   - **Occupation:** Life Insurance Agent (California)
5. **Social proof:** testimonials / trust markers (placeholder until real ones supplied).
6. **Primary funnel CTA band:** big "Get Started" → quiz.
7. **Footer:** contact, **"NXG Life Group © 2026 · CA License #4490102"**, privacy, and disclosures (educational only; not financial/legal/tax advice; products involve fees/limitations/surrender periods).

### 3.3 The funnel flow (already built — integrate, don't rebuild)
- **Quiz** (`src/pages/QuizPage.tsx`, questions in `src/lib/quizLogic.ts`): 7-step questionnaire; "top priority" is the `primary_concern` question.
- **Contact** (`src/pages/DetailsPage.tsx`): first name, last name, **email (required)**, **mobile (required)**, call consent (required, TCPA/AI-dialing language), optional email opt-in.
- **Silent call** (`src/components/CallTrigger.tsx`): after `siteConfig.callDelaySeconds` (default **15s**), it calls the client **with no UI** — they simply browse `/results` and their phone rings. Change the delay in `src/site/siteConfig.ts` (0 = instant).
- You may re-skin the quiz/contact screens to match your homepage, but keep their logic and the `CallTrigger` intact.

### 3.4 Integration contract (what the site sends)
On contact submit, the app POSTs a `LeadPayload` to
`/.netlify/functions/trigger-retell-call` (server-side; keys never in the browser).
Payload fields (see `src/types/funnel.ts`):
```jsonc
{
  "source": "funnel_quiz",
  "first_name", "last_name", "email", "phone",   // phone normalized to E.164
  "answers": { /* quiz answers incl. primary_concern */ },
  "tags": ["focus:...", "intent:high", ...],
  "consent_call": true, "consent_email": true, "consent_sms": false,
  "pipeline_stage": "call_intent",
  "submitted_at": "ISO"
}
```
The function forwards name/priority/date to Greece as dynamic variables and (NEW,
below) writes the lead to Supabase.

---

## 4. Dashboard spec (the big new build)

A private command center where Anthony sees **every lead and everything vital**.
Modern-futuristic theme, brand colors.

### 4.1 Auth
- **Supabase Auth** (email/password), single admin (Anthony). Login page mirrors
  the old "NXG Life · Admin Portal · Welcome Back" screen but re-themed.
- All `/dashboard/*` routes gated; unauthenticated → login. Footer shows CA License #4490102.

### 4.2 Data backend — **Supabase (recommended)**
Postgres + Auth + Realtime + Edge Functions, deploys alongside Netlify. (A Supabase
project can be provisioned on request — see §6.) Proposed `leads` table:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text, last_name text,
  email text, phone text,                         -- E.164
  primary_concern text,                           -- taxes|retirement_income|protect_family|grow_safely|legacy
  intent text,                                    -- PROTECTION|RETIREMENT|IBC (from the call)
  quiz_answers jsonb,                             -- full quiz payload
  tags text[],
  consent_call boolean, consent_email boolean, consent_sms boolean,
  pipeline_stage text default 'new_lead',         -- new_lead|call_intent|transferred|booked|contacted|converted|closed_lost|dnc
  call_status text,                               -- dialing|transferred|no_answer|voicemail|completed
  call_outcome text,                              -- TRANSFERRED|BOOKED|NO_BOOKING|OUT_OF_STATE|DNC
  transcript_url text, recording_url text,
  appointment_at timestamptz,                     -- from Cal.com when booked
  opted_out boolean default false,
  notes text,
  updated_at timestamptz default now()
);
```
Enable **Realtime** on `leads` so the dashboard updates live. RLS: only the admin role can read/write.

### 4.3 How data gets in (data flow — small backend additions)
1. **On submit:** `trigger-retell-call` (already there) also **inserts a `leads` row** (`pipeline_stage='call_intent'`, quiz answers, consent, tags). *(One small addition to the existing function — I can add it.)*
2. **On call end:** a **Retell post-call webhook** (new Netlify/Supabase function) updates the row: `call_status`, `call_outcome`, `intent`, `transcript_url`, `recording_url`, and `pipeline_stage` (`transferred`/`booked`).
3. **On booking:** Cal.com booking (or Greece's book step) sets `appointment_at` + `pipeline_stage='booked'`.
4. **Opt-out:** if Greece tags DNC, set `opted_out=true`, `pipeline_stage='dnc'`.

### 4.4 Dashboard views & widgets
**Top command bar / KPIs (live):** Total Leads · New (today) · In Progress · Booked · Converted. Animated counters.

**Panels:**
- **Intent Distribution** — bar/segmented viz of `primary_concern`/`intent` (Protection, Retirement, IBC, other).
- **Compliance Status** — Opted-In / Opted-Out / Do-Not-Contact counts (color-coded).
- **Outreach Queue** — leads awaiting action; live Greece call states (dialing → transferred → booked).
- **Quiet Hours / TCPA window** — show current calling-window status. **TCPA: only call 8am–9pm in the contact's local time.** Display a "Quiet Hours active" badge (the old dashboard used ~6:30pm–8:30am PT); make the window configurable in Settings.
- **Recent Leads table** — name, phone, priority, intent, stage, call outcome, appointment, created; click → **Lead detail**.
- **Lead detail (drawer/page):** full contact, consent flags, **all quiz answers**, call status/outcome, **transcript + recording links**, appointment, editable **stage** + **notes**, and quick actions: **Call**, **Book**, **Mark DNC**. (Actions can call Retell/Cal.com APIs via a server function — I can wire these.)
- **Activity feed / timeline** (nice-to-have): realtime event stream.

**Realtime:** subscribe to `leads` changes so new submissions pop in instantly (a subtle gold pulse/toast fits the futuristic theme).

### 4.5 Settings
- Calling window (quiet hours) per TCPA · Greece transfer number · Cal.com event · Twilio SMS on/off (future) · admin profile.

---

## 5. Tech & repo guidance
- **Recommended:** build inside this repo (Vite + React + TS) so you reuse the funnel
  components, the Netlify functions, and the existing deploy. Public site under
  `src/site/` + `src/pages/`; dashboard under `src/dashboard/`. Add
  `@supabase/supabase-js` for data/auth.
- Keep it deployable on **Netlify** (base dir `LIFE FUNNEL`, publish `dist`,
  functions `netlify/functions`). SPA routing already handled.
- Don't touch: `netlify/functions/trigger-retell-call.mjs`, `src/lib/*`,
  `src/context/FunnelContext.tsx`, the quiz logic, `CallTrigger`. Extend, don't replace.

---

## 6. What I (system) will do vs. what Athena does
**Athena builds:** the homepage, the re-skinned quiz/contact screens, the full
dashboard UI, and the login page — all visual/layout/UX.

**System (ask me to do these — they touch keys/DB/functions):**
- Provision the **Supabase** project + `leads` schema + RLS + auth.
- Add the **DB insert** to `trigger-retell-call`.
- Build the **Retell post-call webhook** and **Cal.com** update function.
- Wire dashboard **action endpoints** (call/book/DNC) that use the Retell/Cal.com APIs.

## 7. Assets & content the user must provide
- `public/logo.svg` (gold NXG shield) and `public/anthony.jpg` (waist-up photo).
- Real bio copy, services copy, testimonials.
- Confirm: **Anthony Morales · CA License #4490102 · Life Insurance Agent**.

## 8. Compliance (must-haves)
- Show **CA license #4490102** in footer + About + login.
- **TCPA:** honor calling windows (8am–9pm local) and consent; the dashboard's quiet-hours gate enforces this.
- Educational positioning only — no guarantees/pricing in public copy.
- Track consent + opt-out on every lead; DNC suppresses outreach.
