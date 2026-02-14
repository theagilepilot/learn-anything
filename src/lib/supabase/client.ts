import { createBrowserClient } from "@supabase/ssr";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && url.startsWith("http")) return url;
  return "https://placeholder.supabase.co";
}

function getSupabaseKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
}

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseKey());
}
