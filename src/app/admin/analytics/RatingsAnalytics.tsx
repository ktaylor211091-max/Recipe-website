import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function RatingsAnalytics() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // Get recipes with their ratings
  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      `
      id,
      title,
      slug,
      category,
      recipe_reviews (
        rating
      )
    `
    )
    .eq("published", true);

  if (!recipes) return null;

  // Calculate analytics
  const recipeStats = recipes
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
        category: recipe.category,
        rating_count: ratings.length,
        avg_rating: avgRating,
      };
    })
    .filter((r) => r.rating_count > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating);

  const totalRatings = recipeStats.reduce((sum, r) => sum + r.rating_count, 0);
  const overallAvg =
    recipeStats.length > 0
      ? recipeStats.reduce((sum, r) => sum + r.avg_rating, 0) / recipeStats.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600 mb-2">Total Ratings</p>
          <p className="text-3xl font-bold text-neutral-900">{totalRatings}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600 mb-2">Rated Recipes</p>
          <p className="text-3xl font-bold text-neutral-900">{recipeStats.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600 mb-2">Overall Average</p>
          <p className="text-3xl font-bold text-emerald-600">
            {overallAvg.toFixed(2)} ⭐
          </p>
        </div>
      </div>

      {/* Top Rated Recipes */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">
          🏆 Top Rated Recipes
        </h3>
        <div className="space-y-3">
          {recipeStats.slice(0, 10).map((recipe, index) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="font-semibold text-neutral-900 hover:text-emerald-600"
                  >
                    {recipe.title}
                  </Link>
                  <p className="text-xs text-neutral-500">{recipe.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">
                    {recipe.avg_rating.toFixed(2)} ⭐
                  </p>
                  <p className="text-xs text-neutral-500">
                    {recipe.rating_count} ratings
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">
          📊 Ratings by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(
            recipeStats.reduce(
              (acc, recipe) => {
                if (!acc[recipe.category]) {
                  acc[recipe.category] = { count: 0, total: 0 };
                }
                acc[recipe.category].count += recipe.rating_count;
                acc[recipe.category].total += recipe.avg_rating * recipe.rating_count;
                return acc;
              },
              {} as Record<string, { count: number; total: number }>
            )
          )
            .map(([category, stats]) => ({
              category,
              avg: stats.total / stats.count,
              count: stats.count,
            }))
            .sort((a, b) => b.avg - a.avg)
            .map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
              >
                <span className="font-medium text-neutral-900">{cat.category}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600">
                    {cat.count} ratings
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {cat.avg.toFixed(2)} ⭐
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
