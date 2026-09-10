import { createClient, SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null = null;

function getUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante — voir .env.example");
  return url;
}

// Client public en lecture seule (RLS: policy "Public read access")
export function getSupabase(): SupabaseClient {
  if (publicClient) return publicClient;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY manquante — voir .env.example");
  publicClient = createClient(getUrl(), anonKey);
  return publicClient;
}

export function getServiceRoleClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante — requise pour l'ingestion");
  }
  return createClient(getUrl(), serviceKey);
}
