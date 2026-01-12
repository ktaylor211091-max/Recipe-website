import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIG } from "@/lib/supabase/config";
import { RecipeListClient, TrendingRecipes } from "@/features/recipes/components";
import { CategoryDiscovery } from "@/features/categories/components";
import { EmptyState } from "@/components";
import { getCategories } from "./admin/categories/actions";

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_id: string;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  recipe_reviews?: {
    rating: number;
  }[];
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const [recipes, categories, featuredRecipe] = await Promise.all([
    supabase
      ? supabase
          .from("recipes")
          .select("id,title,slug,category,author_id,description,image_path,prep_time_minutes,cook_time_minutes,servings,created_at,recipe_reviews(rating)")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .returns<RecipeRow[]>()
          .then(({ data }) => data)
      : Promise.resolve(null),
    getCategories(),
    supabase
      ? supabase
          .from("recipes")
          .select("id,title,slug,category,author_id,description,image_path,prep_time_minutes,cook_time_minutes,servings,created_at,recipe_reviews(rating)")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(100)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              return data[randomIndex];
            }
            return null;
          })
      : Promise.resolve(null),
  ]);

  return (
    <main className="space-y-16">
      {/* Page Heading */}
      <section className="py-12 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-neutral-900 mb-4 leading-none sm:text-7xl">
          DELICIOUS RECIPES
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Curated collection of recipes. Simple, bold, and made to be enjoyed.
        </p>
      </section>

      {/* Hero Section with Featured Recipe */}
      {featuredRecipe && (
        <section className="relative overflow-hidden rounded-xl bg-neutral-900 text-white">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative aspect-[16/9] lg:aspect-auto">
              {featuredRecipe.image_path ? (
                <Image
                  src={`${SUPABASE_CONFIG.url}/storage/v1/object/public/recipe-images/${featuredRecipe.image_path}`}
                  alt={featuredRecipe.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-800">
                  <div className="text-6xl">🍳</div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-3 inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                FEATURED RECIPE
              </div>
              <h2 className="mb-4 text-4xl font-bold leading-tight lg:text-5xl">
                {featuredRecipe.title}
              </h2>
              {featuredRecipe.description && (
                <p className="mb-6 text-lg text-neutral-300 leading-relaxed">
                  {featuredRecipe.description}
                </p>
              )}
              <div className="mb-6 flex flex-wrap gap-4 text-sm">
                {featuredRecipe.prep_time_minutes && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Prep:</span>
                    <span className="font-medium">{featuredRecipe.prep_time_minutes} min</span>
                  </div>
                )}
                {featuredRecipe.cook_time_minutes && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Cook:</span>
                    <span className="font-medium">{featuredRecipe.cook_time_minutes} min</span>
                  </div>
                )}
                {featuredRecipe.servings && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Serves:</span>
                    <span className="font-medium">{featuredRecipe.servings}</span>
                  </div>
                )}
              </div>
              <Link
                href={`/recipes/${featuredRecipe.slug}`}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-neutral-900 transition-all hover:bg-neutral-100"
              >
                View Recipe
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {!supabase && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <strong>Configuration Required:</strong> Set Vercel env vars
          <b> NEXT_PUBLIC_SUPABASE_URL</b> and
          <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>.
        </div>
      )}

      {/* Category Discovery Section */}
      <CategoryDiscovery categories={categories} />

      {/* Trending Recipes */}
      <TrendingRecipes />

      {/* Latest Recipes Section */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-3xl font-bold text-neutral-900">Latest Recipes</h3>
        </div>

        {!recipes || recipes.length === 0 ? (
          <EmptyState
            illustration="recipe"
            title="No recipes yet"
            description="Be the first to share a delicious recipe with the community!"
            actionLabel="Create Recipe"
            actionHref="/create-recipe"
          />
        ) : (
          <RecipeListClient
            recipes={recipes}
            categories={categories}
            supabaseUrl={SUPABASE_CONFIG.url}
            bucketName="recipe-images"
          />
        )}
      </section>
    </main>
  );
}
