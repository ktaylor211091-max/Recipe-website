import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: recipes } = supabase
    ? await supabase
        .from("recipes")
        .select("id,title,slug,description,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .returns<RecipeRow[]>()
    : { data: null };

  return (
    <main>
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Find something good to cook
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600">
            Browse published recipes below. Admins can log in to upload new
            recipes.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/recipes/example-recipe"
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-800"
          >
            View example recipe
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Go to admin
          </Link>
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
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold">Recipes</h2>
          <Link className="text-sm underline" href="/admin">
            Add recipes (admin)
          </Link>
        </div>

        {!recipes || recipes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            No published recipes yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.slug}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:bg-neutral-50"
              >
                <div className="text-base font-semibold">{r.title}</div>
                {r.description ? (
                  <div className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">
                    {r.description}
                  </div>
                ) : null}
                <div className="mt-4 text-xs text-neutral-500">/{r.slug}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
