import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecipeListClient } from "./RecipeListClient";

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: recipes } = supabase
    ? await supabase
        .from("recipes")
        .select("id,title,slug,category,description,image_path,prep_time_minutes,cook_time_minutes,servings,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .returns<RecipeRow[]>()
    : { data: null };

  return (
    <main>
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Find something good to cook
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600">
            Browse and search published recipes below.
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
        <h2 className="text-base font-semibold mb-4">Recipes</h2>

        {!recipes || recipes.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
            No published recipes yet.
          </div>
        ) : (
          <RecipeListClient
            recipes={recipes}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
            bucketName="recipe-images"
          />
        )}
      </section>
    </main>
  );
}
