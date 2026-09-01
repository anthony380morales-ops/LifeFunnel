# NXG Life Group — Website + Dashboard Build Spec (for Athena)

**Author:** system architecture · **Build owner:** Athena (design/build agent)
**Status:** ready to build · **Brand:** NXG Life Group (California)

This is the architecture and build brief for the new public experience **and** a new
private admin dashboard. The **funnel + AI-caller "Greece" + Cal.com booking are
already built and working** — do not rebuild them. Your job is the presentation
and a brand-new dashboard, wired to the contracts below.

You have creative freedom on layout and visuals ("award-winning, unique") **within
the brand system** in §2. The public experience is elegant/luxury-fintech; the
dashboard is modern-futuristic tech.

> ⛔ **NON-NEGOTIABLE ENTRY RULE:** The LifeFunnel **quiz is a mandatory gate** and
> the FIRST thing every visitor sees — it loads instantly on arrival at any URL.
> **There is NO pre-quiz homepage and NO "Get Started" button anywhere.** The user
> **cannot skip or exit** the quiz; they must complete it (and leave contact
> details) before any company/About content is shown. All the "read about me"
> content lives on the page they see **after** the quiz.

---

## 1. System overview

```
   VISITOR ARRIVES AT ANY URL
              │
              ▼
   ┌─────────────────────────────────────────────┐
   │  /   →  LIFEFUNNEL QUIZ (mandatory gate)      │  ← instant, no skip, no exit
   │         7-step questionnaire                  │
   │              ↓ (all required questions done)  │
   │  /details  →  Contact (name/email/phone/consent)
   └───────────────────────┬─────────────────────┘
                           │ on submit
                           ▼
        POST /.netlify/functions/trigger-retell-call   (ALREADY BUILT)
                           │
        ┌──────────────────┼───────────────────────┐
        ▼                  ▼                        ▼
   Greece calls the   writes lead to          (optional) forwards
   client (silently,  Supabase (NEW)          to any webhook
   ~15s later) →                              
   warm-transfers                             
   to Anthony; books                          
   Cal.com if no answer                       
                           │
                           ▼
   /results  →  THE COMPANY / ABOUT PAGE (Athena designs this)
                the visitor reads it while their phone rings.
                This is the ONLY place the public site content lives.

   PRIVATE: /dashboard  →  Supabase-auth login → command-center dashboard
```

**One brand, one data store (Supabase).** The public flow is quiz-gated; the
dashboard is auth-gated to Anthony and reached by a **direct `/dashboard` URL**
(there is no public nav/homepage to link it from).

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

**Public vibe:** premium, trustworthy, calm luxury fintech. Gold accents, real family imagery.
**Dashboard vibe:** modern-futuristic command center — glassmorphism/neon-gold data viz, live tickers, dense but legible, dark.

---

## 3. Public experience spec

### 3.1 Routes
| Path | Page |
|------|------|
| `/` | **LifeFunnel quiz — mandatory gate, loads instantly.** No homepage, no Get Started. |
| `/details` | Contact capture (already built). Only reachable after the quiz is complete. |
| `/results` | The **company / About page** — shown only after quiz + contact; the visitor reads it while Greece calls (silently). |
| `/dashboard/*` | Private admin app (see §4), reached by direct URL. |

Guards already enforce the gate: `/details` and `/results` redirect back to `/` if
the quiz isn't complete (and `/results` also requires contact details). There are
**no exit or navigation links** out of the quiz.

### 3.2 The quiz gate (already built — re-skin only)
- `src/pages/QuizPage.tsx` + `src/lib/quizLogic.ts`: the 7-step questionnaire; the
  "top priority" is the `primary_concern` question.
- Required questions must be answered to advance; the only optional item is the
  final free-text "anything else" field. **Do not add a skip/exit for the quiz
  itself.** You may restyle the quiz to match the brand, but keep its logic and the
  completion guard intact.
- **This is the first and only thing a new visitor sees.** Make it feel premium and
  effortless (progress indicator, one question at a time, big tap targets).

### 3.3 Contact step (already built — re-skin only)
`src/pages/DetailsPage.tsx`: first name, last name, **email (required)**,
**mobile (required)**, call consent (required — TCPA/AI-dialing language), optional
email opt-in. On submit it stores contact and moves to `/results`.

### 3.4 The company / About page = `/results` (THIS is where your website content lives)
Everything the old homepage showed "as you scrolled" goes **here**, because this is
the page shown after the quiz. Design it as the full NXG Life Group page:
1. **Hero:** cinematic family image, eyebrow, serif headline "Turning Uncertainty Into Certainty," subhead, tagline. (No CTA button needed — the call is already coming.)
2. **What we do / Services:** Protection (term/whole/IUL/final expense), Retirement (annuities/rollovers/income), Infinite Banking / legacy, tax-aware strategies.
3. **About Anthony (bio):** waist-up photo (user provides `anthony.jpg` → `public/`), short bio, and these facts prominently:
   - **Name:** Anthony Morales
   - **License #:** 4490102
   - **Occupation:** Life Insurance Agent (California)
4. **Social proof:** testimonials / trust markers (placeholder until supplied).
5. **Footer:** contact, **"NXG Life Group © 2026 · CA License #4490102,"** privacy, disclosures (educational only; not financial/legal/tax advice; products involve fees/limitations/surrender periods).

Build this by editing **`src/site/AboutContent.tsx`** (the whole file is yours).

### 3.5 The silent call (already built — leave intact)
`src/components/CallTrigger.tsx`: mounted on `/results`, it renders **nothing** and,
after `siteConfig.callDelaySeconds` (default **15s**, `0` = instant), places the
Greece call once. The visitor simply reads your page and their phone rings. Keep
`<CallTrigger/>` mounted; don't add any phone/email form to your page (contact is
already captured on `/details` — a second form would double-trigger).

### 3.6 Integration contract (what the app sends)
On contact submit, a `LeadPayload` is POSTed to
`/.netlify/functions/trigger-retell-call` (server-side; keys never in the browser):
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
Modern-futuristic theme, brand colors. Reached at **`/dashboard`** (no public link).

### 4.1 Auth
- **Supabase Auth** (email/password), single admin (Anthony). Login page re-themed
  ("NXG Life · Admin Portal · Welcome Back"); footer shows CA License #4490102.
- All `/dashboard/*` routes gated; unauthenticated → login.

### 4.2 Data backend — **Supabase (recommended)**
Postgres + Auth + Realtime + Edge Functions, deploys alongside Netlify. Proposed
`leads` table:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text, last_name text,
  email text, phone text,                         -- E.164
  primary_concern text,                           -- taxes|retirement_income|protect_family|grow_safely|legacy
  intent text,                                    -- PROTECTION|RETIREMENT|IBC (from the call)
  quiz_answers jsonb,
  tags text[],
  consent_call boolean, consent_email boolean, consent_sms boolean,
  pipeline_stage text default 'new_lead',         -- new_lead|call_intent|transferred|booked|contacted|converted|closed_lost|dnc
  call_status text,                               -- dialing|transferred|no_answer|voicemail|completed
  call_outcome text,                              -- TRANSFERRED|BOOKED|NO_BOOKING|OUT_OF_STATE|DNC
  transcript_url text, recording_url text,
  appointment_at timestamptz,
  opted_out boolean default false,
  notes text,
  updated_at timestamptz default now()
);
```
Enable **Realtime** on `leads`. RLS: only the admin role reads/writes.

### 4.3 How data gets in (small backend additions — system will do)
1. **On submit:** `trigger-retell-call` also **inserts a `leads` row** (`call_intent`, quiz answers, consent, tags).
2. **On call end:** a **Retell post-call webhook** updates `call_status`, `call_outcome`, `intent`, `transcript_url`, `recording_url`, `pipeline_stage`.
3. **On booking:** Cal.com sets `appointment_at` + `pipeline_stage='booked'`.
4. **Opt-out:** DNC tag → `opted_out=true`, `pipeline_stage='dnc'`.

### 4.4 Dashboard views & widgets
**KPIs (live):** Total Leads · New (today) · In Progress · Booked · Converted.
**Panels:**
- **Intent Distribution** — Protection / Retirement / IBC / other.
- **Compliance Status** — Opted-In / Opted-Out / Do-Not-Contact.
- **Outreach Queue** — leads awaiting action + live Greece states (dialing → transferred → booked).
- **Quiet Hours / TCPA window** — current calling-window status. **TCPA: only call 8am–9pm in the contact's local time.** "Quiet Hours" badge; window configurable in Settings.
- **Recent Leads table** — name, phone, priority, intent, stage, outcome, appointment, created → click for detail.
- **Lead detail (drawer/page):** full contact, consent flags, **all quiz answers**, call status/outcome, **transcript + recording links**, appointment, editable **stage** + **notes**, quick actions **Call / Book / Mark DNC**.
- **Activity feed / timeline** (nice-to-have): realtime stream.

**Realtime:** subscribe to `leads` so new submissions pop in instantly.

### 4.5 Settings
Calling window (quiet hours) · Greece transfer number · Cal.com event · Twilio SMS on/off (future) · admin profile.

---

## 5. Tech & repo guidance
- **Recommended:** build inside this repo (Vite + React + TS) to reuse the funnel
  components, Netlify functions, and deploy. Public content under `src/site/`;
  dashboard under `src/dashboard/`. Add `@supabase/supabase-js`.
- Keep it deployable on **Netlify** (base dir `LIFE FUNNEL`, publish `dist`,
  functions `netlify/functions`).
- **Do not touch:** `netlify/functions/trigger-retell-call.mjs`, `src/lib/*`,
  `src/context/FunnelContext.tsx`, `src/pages/QuizPage.tsx`,
  `src/pages/DetailsPage.tsx`, `src/components/CallTrigger.tsx`, the completion
  guards. Re-skin the quiz/contact; build `AboutContent` and the dashboard.

## 6. System vs. Athena
**Athena builds:** the re-skinned quiz/contact screens, the `/results` company page
(`AboutContent`), the full dashboard UI, and the login page — all visual/UX.
**System (ask me — these touch keys/DB/functions):** provision Supabase + schema +
auth; add the DB insert to `trigger-retell-call`; build the Retell post-call webhook
+ Cal.com update; wire dashboard action endpoints (call/book/DNC).

## 7. Assets & content the user must provide
- `public/logo.svg` (gold NXG shield) and `public/anthony.jpg` (waist-up photo).
- Real bio, services copy, testimonials.
- Confirm: **Anthony Morales · CA License #4490102 · Life Insurance Agent**.

## 8. Compliance (must-haves)
- Show **CA license #4490102** in footer + About + login.
- **TCPA:** honor calling windows (8am–9pm local) and consent; dashboard quiet-hours gate enforces this.
- Educational positioning only — no guarantees/pricing in public copy.
- Track consent + opt-out on every lead; DNC suppresses outreach.
