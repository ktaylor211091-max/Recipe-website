import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_CONFIG } from "./config";

export function createSupabaseBrowserClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    SUPABASE_CONFIG.url;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY ??
    SUPABASE_CONFIG.anonKey;

  if (!url || !anonKey || anonKey === "YOUR_KEY_HERE") {
    throw new Error(
      "Missing Supabase config. Edit src/lib/supabase/config.ts and paste your anon/publishable key.",
    );
  }

  return createBrowserClient(url, anonKey);
}
