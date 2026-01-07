import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  let anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();

  // Hardcoded fallback (temporary workaround for Vercel env var issues)
  const FALLBACK_URL = "https://hojzqqefgvvaztkcsiys.supabase.co";
  const FALLBACK_KEY = "sb_publishable_w5bc9NxWE5o-G1h-OnVNWg_03Tp0ZSx";

  url = url || FALLBACK_URL;
  anonKey = anonKey || FALLBACK_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase config (this should never happen with fallback).",
    );
  }

  return createBrowserClient(url, anonKey);
}
