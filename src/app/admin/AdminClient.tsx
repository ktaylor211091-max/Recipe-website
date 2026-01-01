"use client";

import { useMemo } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold">Status</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Supabase is configured if this page loads without an environment variable
        error.
      </p>

      <button
        className="mt-4 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        type="button"
        onClick={async () => {
          const { data } = await supabase.auth.getUser();
          const email = data.user?.email ?? "(not signed in)";
          alert(`Signed in as: ${email}`);
        }}
      >
        Check signed-in user
      </button>
    </div>
  );
}
