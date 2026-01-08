import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategories } from "../admin/categories/actions";
import { getTags } from "../admin/actions";
import { createUserRecipe } from "./actions";

type Props = {
  searchParams: Promise<{ fork?: string; error?: string }>;
};

export default async function CreateRecipePage({ searchParams }: Props) {
  const { fork: forkRecipeId, error } = await searchParams;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  // If forking, fetch the original recipe
  let originalRecipe = null;
  if (forkRecipeId) {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", forkRecipeId)
      .single();
    originalRecipe = data;
  }

  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ]);

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {originalRecipe ? `Fork: ${originalRecipe.title}` : "Create New Recipe"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {originalRecipe 
            ? "Create your own variation of this recipe"
            : "Share your culinary creation with the community"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-900">Error</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form action={createUserRecipe} className="space-y-6">
          {forkRecipeId && (
            <input type="hidden" name="fork_recipe_id" value={forkRecipeId} />
          )}

          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Recipe Title *
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={originalRecipe?.title ? `${originalRecipe.title} (My Version)` : ""}
              placeholder="e.g., Grandma's Chocolate Chip Cookies"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Category *
            </label>
            <select
              name="category"
              required
              defaultValue={originalRecipe?.category || ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={originalRecipe?.description || ""}
              placeholder="Tell us about your recipe..."
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Times and Servings */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Prep Time (minutes)
              </label>
              <input
                name="prep_time_minutes"
                type="number"
                min="0"
                defaultValue={originalRecipe?.prep_time_minutes || ""}
                placeholder="15"
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Cook Time (minutes)
              </label>
              <input
                name="cook_time_minutes"
                type="number"
                min="0"
                defaultValue={originalRecipe?.cook_time_minutes || ""}
                placeholder="30"
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Servings
              </label>
              <input
                name="servings"
                type="number"
                min="1"
                defaultValue={originalRecipe?.servings || ""}
                placeholder="4"
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Ingredients (one per line) *
            </label>
            <textarea
              name="ingredients"
              rows={8}
              required
              defaultValue={originalRecipe?.ingredients ? originalRecipe.ingredients.join('\n') : ""}
              placeholder="2 cups all-purpose flour&#10;1 cup butter, softened&#10;3/4 cup sugar&#10;2 eggs"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Instructions (one step per line) *
            </label>
            <textarea
              name="steps"
              rows={10}
              required
              defaultValue={originalRecipe?.steps ? originalRecipe.steps.join('\n') : ""}
              placeholder="Preheat oven to 375°F&#10;Mix butter and sugar until creamy&#10;Add eggs and beat well&#10;Gradually stir in flour"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Nutrition (Optional) */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Nutrition Information (optional, per serving)
            </h3>
            <div className="grid gap-4 sm:grid-cols-5">
              <div>
                <label className="block text-xs font-medium text-neutral-600">Calories</label>
                <input
                  name="calories"
                  type="number"
                  min="0"
                  placeholder="250"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Protein (g)</label>
                <input
                  name="protein_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Carbs (g)</label>
                <input
                  name="carbs_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="30"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Fat (g)</label>
                <input
                  name="fat_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="12"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">Fiber (g)</label>
                <input
                  name="fiber_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="2"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag.id}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Tips */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Cook's Notes
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Any important notes or variations..."
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Pro Tips
              </label>
              <textarea
                name="tips"
                rows={4}
                placeholder="Share your tips for the best results..."
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Recipe Photo
            </label>
            <input
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:rounded file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Best results: JPG/PNG/WebP. Max 5MB. A good photo helps your recipe stand out!
            </p>
          </div>

          {/* Publish Option */}
          <div className="flex items-center gap-2">
            <input
              name="published"
              type="checkbox"
              defaultChecked
              className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label className="text-sm font-medium text-neutral-700">
              Publish immediately (uncheck to save as draft)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-200">
            <Link
              href="/account"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
