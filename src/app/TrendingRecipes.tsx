import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SUPABASE_CONFIG } from "@/lib/supabase/config";

type TrendingRecipe = {
  id: string;
  title: string;
  slug: string;
  image_path: string | null;
  category: string;
  avg_rating: number | null;
  rating_count: number;
};

export async function TrendingRecipes() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Get recipes with ratings
  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      `
      id,
      title,
      slug,
      image_path,
      category,
      recipe_reviews (
        rating
      )
    `
    )
    .eq("published", true)
    .limit(6);

  if (!recipes || recipes.length === 0) return null;

  // Calculate ratings and sort
  const trendingRecipes: TrendingRecipe[] = recipes
    .map((recipe) => {
      const ratings = recipe.recipe_reviews?.map((r: any) => r.rating) || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0;

      return {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        image_path: recipe.image_path,
        category: recipe.category,
        avg_rating: avgRating,
        rating_count: ratings.length,
      };
    })
    .filter((r) => r.rating_count > 0)
    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    .slice(0, 6);

  if (trendingRecipes.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-neutral-900 text-white px-6 py-10 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500 blur-[120px]" />
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-orange-500 blur-[140px]" />
      </div>

      <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200">
            <span>Trending</span>
            <span className="text-emerald-100">This week</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">🔥 Trending Recipes</h2>
          <p className="text-sm text-neutral-200 max-w-2xl">
            Most-loved recipes right now, picked by ratings. Bold flavors, crowd-pleasers, zero filler.
          </p>
        </div>
        <Link
          href="/recipes"
          className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          See all recipes
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trendingRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-white/10"
          >
            <div className="relative aspect-video overflow-hidden">
              {recipe.image_path ? (
                <Image
                  src={`${SUPABASE_CONFIG.url}/storage/v1/object/public/recipe-images/${recipe.image_path}`}
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-5xl">
                  🍳
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <span className="flex items-center gap-1 text-emerald-100">
                  <span>🔥</span>
                  <span>{recipe.avg_rating?.toFixed(1)}</span>
                </span>
                <span className="text-neutral-200">{recipe.rating_count} ratings</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <div className="inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {recipe.category}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-white line-clamp-2 transition-colors group-hover:text-emerald-200">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-200/80">
                <span className="h-1 w-1 rounded-full bg-emerald-300" aria-hidden />
                <span>Fan favorite</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
