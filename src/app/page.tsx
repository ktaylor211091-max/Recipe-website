import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  created_at: string;
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: recipes } = supabase
    ? await supabase
        .from("recipes")
        .select("id,title,slug,category,description,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .returns<RecipeRow[]>()
    : { data: null };

  const byCategory = (recipes ?? []).reduce<Record<string, RecipeRow[]>>(
    (acc, r) => {
      const cat = (r.category ?? "General").trim() || "General";
      (acc[cat] ??= []).push(r);
      return acc;
    },
    {},
  );

  const categories = Object.keys(byCategory).sort((a, b) => a.localeCompare(b));

  return (
    <main>
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Find something good to cook
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600">
            Browse published recipes below.
          </p>
        </div>

        {!supabase ? (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Supabase is not configured. Set Vercel env vars
            <b> NEXT_PUBLIC_SUPABASE_URL</b> and
            <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>.
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold">Recipes</h2>

        {!recipes || recipes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            No published recipes yet.
          </div>
        ) : (
          <div className="mt-4 space-y-8">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                    {cat}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {byCategory[cat].length} recipe{byCategory[cat].length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {byCategory[cat].map((r) => (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:bg-neutral-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-base font-semibold">{r.title}</div>
                        <div className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                          {(r.category ?? "General").trim() || "General"}
                        </div>
                      </div>
                      {r.description ? (
                        <div className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">
                          {r.description}
                        </div>
                      ) : null}
                      <div className="mt-4 text-xs text-neutral-500">/{r.slug}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
