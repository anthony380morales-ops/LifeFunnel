-- NXG Life Group — leads table (applied to Supabase project nxg-life-leads).
-- Server functions write via the service role (bypasses RLS); the admin
-- dashboard reads/updates via an authenticated Supabase Auth session.

create extension if not exists pgcrypto;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  email text,
  phone text,                       -- E.164
  primary_concern text,             -- taxes | retirement_income | protect_family | grow_safely | legacy
  primary_concern_label text,       -- speakable version
  intent text,                      -- PROTECTION | RETIREMENT | IBC (from the call)
  quiz_answers jsonb,
  tags text[],
  consent_call boolean default false,
  consent_email boolean default false,
  consent_sms boolean default false,
  pipeline_stage text default 'new_lead',   -- new_lead|call_intent|transferred|booked|contacted|converted|closed_lost|dnc
  call_status text,                 -- dialing | completed
  call_outcome text,                -- TRANSFERRED | BOOKED | NO_BOOKING | OUT_OF_STATE | DNC
  retell_call_id text,
  transcript text,
  transcript_url text,
  recording_url text,
  appointment_at timestamptz,
  opted_out boolean default false,
  notes text
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_retell_call_id_idx on public.leads (retell_call_id);
create index leads_pipeline_stage_idx on public.leads (pipeline_stage);

create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

create policy "authenticated can read leads"
  on public.leads for select to authenticated using (true);

create policy "authenticated can insert leads"
  on public.leads for insert to authenticated with check (true);

create policy "authenticated can update leads"
  on public.leads for update to authenticated using (true) with check (true);

alter publication supabase_realtime add table public.leads;
