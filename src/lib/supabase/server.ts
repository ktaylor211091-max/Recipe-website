import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_CONFIG } from "./config";

export function getSupabaseEnv() {
  // Try env vars first, then fall back to hardcoded config
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?. trim() ||
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

  return { url, anonKey };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    console.error(
      "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can't set cookies; server actions and route handlers can.
        }
      },
    },
  });
}
