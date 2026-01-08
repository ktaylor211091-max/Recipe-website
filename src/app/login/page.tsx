import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorMessage =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
        ? sp.error[0]
        : "";

  // Check if user is already signed in
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes.user) {
      redirect("/account");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in to your account
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg">
          <form action={signIn} className="space-y-4">
            <label className="block">
              <div className="mb-2 text-sm font-medium text-neutral-700">
                Email
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-medium text-neutral-700">
                Password
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
