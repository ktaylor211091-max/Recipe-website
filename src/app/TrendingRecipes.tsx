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
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">🔥 Trending Recipes</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Most popular recipes this week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="group relative rounded-lg border border-neutral-200 overflow-hidden bg-white hover:shadow-lg transition-all duration-300 hover:border-emerald-300"
          >
            {/* Image */}
            <div className="relative aspect-video overflow-hidden bg-neutral-100">
              {recipe.image_path ? (
                <Image
                  src={`${SUPABASE_CONFIG.url}/storage/v1/object/public/recipe-images/${recipe.image_path}`}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  🍳
                </div>
              )}

              {/* Trending Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-3 py-1.5 shadow-lg">
                <span className="text-sm font-bold">🔥 {recipe.avg_rating?.toFixed(1)}</span>
                <span className="text-xs">({recipe.rating_count})</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-neutral-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {recipe.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-2">{recipe.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
