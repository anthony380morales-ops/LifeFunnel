import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True once VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set in the env. */
export const supabaseReady = Boolean(url && anonKey);

/** Supabase client, or null if env isn't configured yet (dashboard shows a notice). */
export const supabase: SupabaseClient | null = supabaseReady ? createClient(url!, anonKey!) : null;

/** A row from the public.leads table (see supabase/migrations/0001_create_leads.sql). */
export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  primary_concern: string | null;
  primary_concern_label: string | null;
  intent: string | null;
  quiz_answers: Record<string, unknown> | null;
  tags: string[] | null;
  consent_call: boolean | null;
  consent_email: boolean | null;
  consent_sms: boolean | null;
  pipeline_stage: string | null;
  call_status: string | null;
  call_outcome: string | null;
  retell_call_id: string | null;
  transcript: string | null;
  recording_url: string | null;
  appointment_at: string | null;
  opted_out: boolean | null;
  notes: string | null;
}
