function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY;

  return { url, anonKey };
}

async function main() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    console.error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or supported fallbacks) in your shell/.env and try again.",
    );
    process.exitCode = 1;
    return;
  }

  const endpoint = `${url.replace(/\/$/, "")}/auth/v1/health`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  const text = await res.text();

  console.log(`GET ${endpoint}`);
  console.log(`Status: ${res.status} ${res.statusText}`);

  // Try JSON, fall back to text.
  try {
    const json = JSON.parse(text);
    console.log(JSON.stringify(json, null, 2));
  } catch {
    console.log(text);
  }

  if (!res.ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Health check failed:");
  console.error(err?.stack || err);
  process.exitCode = 1;
});
