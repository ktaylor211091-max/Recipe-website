import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY;

  return { url, anonKey };
}

export async function GET() {
  const allEnvKeys = Object.keys(process.env || {});
  const seenSupabaseKeys = allEnvKeys
    .filter((k) => k.toUpperCase().includes("SUPABASE"))
    .sort();

  const { url, anonKey } = getSupabaseEnv();

  const configured = Boolean(url && anonKey);

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        vercel: {
          VERCEL: process.env.VERCEL ?? null,
          VERCEL_ENV: process.env.VERCEL_ENV ?? null,
          VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        },
        debug: {
          seenSupabaseKeys,
        },
        missing: {
          url: !url,
          anonKey: !anonKey,
        },
        expectedEnv:
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or supported fallbacks) and redeploy.",
      },
      { status: 200 },
    );
  }

  const endpoint = `${url!.replace(/\/$/, "")}/auth/v1/health`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey!}`,
      },
      // Avoid caching so it reflects current configuration.
      cache: "no-store",
    });

    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // keep as text
    }

    return NextResponse.json(
      {
        ok: res.ok,
        configured: true,
        vercel: {
          VERCEL: process.env.VERCEL ?? null,
          VERCEL_ENV: process.env.VERCEL_ENV ?? null,
          VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        },
        debug: {
          seenSupabaseKeys,
        },
        supabase: {
          endpoint,
          status: res.status,
          statusText: res.statusText,
          body,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        vercel: {
          VERCEL: process.env.VERCEL ?? null,
          VERCEL_ENV: process.env.VERCEL_ENV ?? null,
          VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        },
        debug: {
          seenSupabaseKeys,
        },
        supabase: { endpoint },
        error: "Request failed",
      },
      { status: 200 },
    );
  }
}
