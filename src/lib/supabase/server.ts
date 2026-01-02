import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_CONFIG } from "./config";

export function getSupabaseEnv() {
  // Try env vars first, then fall back to hardcoded config
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  let anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY;

  // If env vars are missing/empty, use hardcoded fallback
  if (!url || !anonKey) {
    url = url || SUPABASE_CONFIG.url;
    anonKey = anonKey || SUPABASE_CONFIG.anonKey;
  }

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
