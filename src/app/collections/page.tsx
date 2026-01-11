import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createCollection, deleteCollection, getCollections } from "./actions";

export default async function CollectionsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/");

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) redirect("/login");

  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Collections</h1>
          <p className="text-neutral-600">Organize recipes into personal or public lists.</p>
        </div>
      </div>

      {/* Create Collection */}
      <form action={createCollection} className="rounded-lg border border-neutral-200 bg-white p-5 space-y-3">
        <div>
          <label className="text-sm font-medium text-neutral-700">Name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="e.g., Weeknight Dinners"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Description</label>
          <textarea
            name="description"
            rows={2}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Optional"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_public" name="is_public" value="true" className="h-4 w-4 rounded border-neutral-300 text-emerald-600" />
          <label htmlFor="is_public" className="text-sm text-neutral-700">Make public</label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Create Collection
        </button>
      </form>

      {/* Collections List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-neutral-600">
            No collections yet.
          </div>
        )}
        {collections.map((col) => (
          <div key={col.id} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{col.name}</h3>
                {col.description && (
                  <p className="text-sm text-neutral-600">{col.description}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  {col.is_public ? "Public" : "Private"} • {col.recipe_count || 0} recipes
                </p>
              </div>
              <form action={deleteCollection}>
                <input type="hidden" name="id" value={col.id} />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
