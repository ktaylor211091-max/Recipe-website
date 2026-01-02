import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIG } from "@/lib/supabase/config";
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
    <main className="space-y-24">
      {/* Hero Section */}
      <section className="py-20 text-center animate-fade-in">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-7xl font-bold tracking-tighter text-neutral-900 mb-6 leading-none sm:text-8xl">
            DELICIOUS<br/>RECIPES.
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Curated collection of recipes. Simple, bold, and made to be enjoyed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-neutral-500">
            <span className="px-4 py-2 border border-neutral-200 rounded-full">EASY TO FOLLOW</span>
            <span className="px-4 py-2 border border-neutral-200 rounded-full">TRIED & TESTED</span>
            <span className="px-4 py-2 border border-neutral-200 rounded-full">NO FLUFF</span>
          </div>
        </div>

        {!supabase ? (
          <div className="mt-12 mx-auto max-w-2xl rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-sm text-red-800">
            <strong>Configuration Required:</strong> Set Vercel env vars
            <b> NEXT_PUBLIC_SUPABASE_URL</b> and
            <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>.
          </div>
        ) : null}
      </section>

      {/* Recipes Section */}
      <section>
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-bold tracking-tighter text-neutral-900 mb-4">
            BROWSE RECIPES
          </h2>
          <div className="h-1 w-20 bg-neutral-900 mx-auto"></div>
        </div>

        {!recipes || recipes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="text-6xl mb-4">🍳</div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">No recipes yet</h3>
              <p className="text-neutral-500">Check back soon for delicious recipes!</p>
            </div>
          </div>
        ) : (
          <RecipeListClient
            recipes={recipes}
            supabaseUrl={SUPABASE_CONFIG.url}
            bucketName="recipe-images"
          />
        )}
      </section>
    </main>
  );
}
