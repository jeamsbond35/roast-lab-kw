import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

let client: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return Boolean(url?.trim() && key?.trim());
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseEnabled() || !url || !key) {
    throw new Error("Supabase: أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY أو VITE_SUPABASE_PUBLISHABLE_KEY في .env.local");
  }
  if (!client) client = createClient(url, key);
  return client;
}

export function tryGetSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null;
  try {
    return getSupabase();
  } catch {
    return null;
  }
}
