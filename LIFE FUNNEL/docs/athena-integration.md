# Athena — landing / company page integration guide

You're building the **NXG Life Group company page**. All the funnel machinery
(quiz, contact capture, the 15-second delay, the Greece phone call, Cal.com
booking) is already wired. **You design one file. Everything else just works.**

## The visitor flow (already built)

```
Visit any URL  →  /  (the quiz loads immediately — no landing page)
                    ↓  visitor answers the ~2-minute questionnaire
                 /details  (name, email, phone, consent)
                    ↓
                 /results  ← YOUR PAGE. A 15-second countdown runs while they
                             read it, then Greece calls them and transfers to
                             Anthony (Cal.com booking is the fallback).
```

## The only file you edit

### `src/site/AboutContent.tsx`
This is the full company / About page shown on `/results`. Build whatever you
want here — hero, Anthony's story, services, testimonials, trust badges,
disclosures. It's a normal React component; style it however you like. The old
landing page (`src/pages/LandingPage.tsx`) is kept **only as a content
reference** — it isn't routed anymore; feel free to lift copy from it.

### `src/site/siteConfig.ts` (optional)
- `companyName`, `tagline` — text you can reuse.
- `callDelaySeconds` — **the countdown length. Change this one number** to make
  the wait longer/shorter (currently `15`).

## What you should NOT touch (it's the plumbing)
- `src/components/CallCountdown.tsx` — the sticky countdown banner + the Greece
  trigger. It renders itself at the top of `/results`, above your content.
- `src/pages/QuizPage.tsx`, `src/pages/DetailsPage.tsx`, `src/pages/ResultsPage.tsx`
- `src/lib/*`, `src/context/*`, `netlify/functions/*`

## Rules that keep the funnel working
1. **Don't remove the countdown.** `ResultsPage` renders `<CallCountdown/>` then
   `<AboutContent/>`. If you restructure `ResultsPage`, keep `<CallCountdown/>`
   mounted — that's what calls the client. (Best: just edit `AboutContent`.)
2. **Don't add a phone/email form to your page.** Contact is already captured on
   `/details`; the call uses that. A second form would double-trigger.
3. **The countdown banner is `position: sticky; top: 0`.** Don't wrap `/results`
   in a container that hides overflow at the top, or it won't stick.
4. **Styling:** existing design tokens (colors, radius, spacing) are in
   `src/styles/global.css` (`var(--accent)`, `var(--text)`, etc.). Reuse them for
   a consistent look, or bring your own CSS — both are fine.

## Test locally
```bash
npm install
npm run dev      # http://localhost:5173
```
Go to `/`, complete the quiz, fill `/details`, and you'll land on your page with
the countdown. (In dev, the call is simulated — no real dial — so you can iterate
freely.) `npm run build` must pass before pushing.

## Deploy
Push to the branch; Netlify auto-builds. Base directory `LIFE FUNNEL`, publish
`dist`. No env-var or function changes needed for design work.
