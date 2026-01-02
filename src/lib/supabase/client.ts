import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_CONFIG } from "./config";

export function createSupabaseBrowserClient() {
  let url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  let anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();

  // If env vars are missing/empty, use hardcoded fallback
  if (!url || !anonKey) {
    url = url || SUPABASE_CONFIG.url;
    anonKey = anonKey || SUPABASE_CONFIG.anonKey;
  }

  if (!url || !anonKey || anonKey === "YOUR_KEY_HERE") {
    throw new Error(
      "Missing Supabase config. Edit src/lib/supabase/config.ts and paste your anon/publishable key.",
    );
  }

  return createBrowserClient(url, anonKey);
}
