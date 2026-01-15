import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signUp } from "./actions";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export default async function SignUpPage({
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

  const successMessage =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
        ? sp.success[0]
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
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Join our community of food lovers
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {successMessage}
            </div>
          )}
          
          <SignUpForm signUpAction={signUp} />

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Sign in
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
          </div>
        </div>
      </div>
    </main>
  );
}
