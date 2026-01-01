import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL;

  // Supabase has recently renamed/introduced publishable keys.
  // We accept several common env var names but still only use public keys.
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY;
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
