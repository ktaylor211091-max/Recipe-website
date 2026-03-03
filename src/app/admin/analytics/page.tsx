import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RatingsAnalytics } from "./RatingsAnalytics";

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) redirect("/admin");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userRes.user.id)
      .single();
    if (profile?.role !== "admin") redirect("/admin?error=Access+denied");
  } else {
    redirect("/admin");
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-neutral-600">
            View insights and statistics for your recipes
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <RatingsAnalytics />
    </div>
  );
}
