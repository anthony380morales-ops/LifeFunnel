# NXG Life Group — Dashboard Backend Guide (for Athena)

The backend for the admin dashboard is **built and live**. This is everything you
need to build the dashboard UI against it. Pair this with `website-architecture.md`.

---

## 1. What's already done (system)
- **Supabase project `nxg-life-leads` is provisioned** with a `leads` table, RLS,
  and Realtime enabled.
- **Every funnel submission is saved** — `netlify/functions/trigger-retell-call.mjs`
  inserts a `leads` row (best-effort) and links it to the Retell call.
- **Call outcomes flow back** — `netlify/functions/retell-post-call.mjs` updates the
  lead with call status, outcome, transcript, recording, and (if booked) the
  appointment.

**You build:** the dashboard UI (login + views) reading/writing this table.

---

## 2. Connection details

| | Value |
|---|---|
| Supabase URL | `https://bhuclkecnnbsovbdplwe.supabase.co` |
| Publishable (anon) key — **client-safe** | `sb_publishable_9RoqfSHEXwWfCFHEVVOZvA_gWmbyD0c` |
| Service role key — **server only, secret** | Get from Supabase → **Project Settings → API → `service_role`**. Never put this in the browser. |

### Netlify environment variables to set
Server (functions):
```
SUPABASE_URL=https://bhuclkecnnbsovbdplwe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<the service_role secret from the Supabase dashboard>
```
Client (dashboard build — Vite):
```
VITE_SUPABASE_URL=https://bhuclkecnnbsovbdplwe.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9RoqfSHEXwWfCFHEVVOZvA_gWmbyD0c
```

---

## 3. The `leads` table (what you'll render)
Columns: `id, created_at, updated_at, first_name, last_name, email, phone,
primary_concern, primary_concern_label, intent, quiz_answers (jsonb), tags (text[]),
consent_call, consent_email, consent_sms, pipeline_stage, call_status, call_outcome,
retell_call_id, transcript, transcript_url, recording_url, appointment_at, opted_out,
notes`.

- `pipeline_stage`: `new_lead | call_intent | transferred | booked | contacted | converted | closed_lost | dnc`
- `call_status`: `dialing | completed`
- `call_outcome`: `TRANSFERRED | BOOKED | NO_BOOKING | OUT_OF_STATE | DNC`
- Full schema: `supabase/migrations/0001_create_leads.sql`.

**Security model (RLS):** server functions write via the service role (bypasses RLS).
The dashboard uses an **authenticated** session — logged-in users can read/insert/update
`leads`; the public/anon role has **no access**, so leads are never exposed publicly.

---

## 4. Create the admin login (one-time)
Supabase dashboard → **Authentication → Users → Add user** → Anthony's email + a
password (email auth is on by default). That's the dashboard login. (You can add a
password-reset flow later.)

---

## 5. Dashboard code — how to connect

Install: `npm i @supabase/supabase-js`

```ts
// src/dashboard/supabase.ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

**Login (gate every /dashboard route):**
```ts
await supabase.auth.signInWithPassword({ email, password });
const { data: { session } } = await supabase.auth.getSession(); // null → show login
await supabase.auth.signOut();
```

**Load leads (newest first):**
```ts
const { data: leads } = await supabase
  .from("leads")
  .select("*")
  .order("created_at", { ascending: false });
```

**Live updates (new submissions pop in):**
```ts
supabase
  .channel("leads")
  .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
    // upsert payload.new into your local state
  })
  .subscribe();
```

**Update a lead (stage / notes / mark DNC) — allowed for the logged-in admin:**
```ts
await supabase.from("leads").update({ pipeline_stage: "converted" }).eq("id", id);
await supabase.from("leads").update({ opted_out: true, pipeline_stage: "dnc" }).eq("id", id);
await supabase.from("leads").update({ notes }).eq("id", id);
```

**KPIs / distributions:** compute client-side from the leads array, or use
`select("pipeline_stage")` / head-count queries. Examples:
- Total = rows; New today = `created_at >= startOfToday`.
- Intent distribution = group by `primary_concern` (or `intent`).
- Compliance = counts where `opted_out`, `consent_call`, etc.

**Re-call a lead from the dashboard:** POST the lead back to the existing
`/.netlify/functions/trigger-retell-call` (same payload shape the funnel sends) — it
re-dials Greece and updates the row.

---

## 6. Point Retell's webhook at us (one-time)
Retell → Greece agent → **Webhook settings** → set the webhook URL to:
```
https://YOUR-SITE.netlify.app/.netlify/functions/retell-post-call
```
That's what writes call outcome, transcript, recording, and the booked appointment
back onto each lead. For the appointment + outcome fields to populate, keep Greece's
**Post-Call Extraction** returning `outcome`, `intent`, and `appointment_time_pt`
(they map straight into the row).

---

## 7. Build checklist for the dashboard
- [ ] `/dashboard` login (Supabase Auth), gate all sub-routes.
- [ ] KPI row: Total · New today · In progress · Booked · Converted.
- [ ] Panels: Intent distribution · Compliance (opted-in/out/DNC) · Outreach queue · TCPA quiet-hours badge.
- [ ] Recent leads table → lead detail (contact, consent, quiz answers, call status/outcome, transcript + recording, appointment, editable stage + notes, actions: Re-call / Mark DNC).
- [ ] Realtime subscription so new leads appear instantly.
- [ ] Modern-futuristic theme in the NXG navy + gold palette.

Everything the dashboard needs already exists in the `leads` table and is kept
current by the two functions above. Build the UI; the data is flowing.
