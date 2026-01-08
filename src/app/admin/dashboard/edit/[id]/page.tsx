import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateRecipe, getTags } from "../../../actions";
import { getCategories } from "../../../categories/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/dashboard");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/admin");
  }

  const [recipe, categories, tags] = await Promise.all([
    supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => data),
    getCategories(),
    getTags(),
  ]);

  if (!recipe) {
    notFound();
  }

  // Get existing tag associations
  const { data: existingTags } = await supabase
    .from("recipe_tags")
    .select("tag_id")
    .eq("recipe_id", recipe.id);

  const selectedTagIds = new Set(existingTags?.map((t) => t.tag_id) ?? []);

  // Safely convert arrays to strings
  const ingredientsText = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients.join("\n") 
    : "";
  
  const stepsText = Array.isArray(recipe.steps) 
    ? recipe.steps.join("\n") 
    : "";

  const imageUrl = recipe.image_path
    ? supabase.storage
        .from("recipe-images")
        .getPublicUrl(recipe.image_path).data.publicUrl
    : null;

  return (
    <main>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Recipe
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Update your recipe details below.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form action={updateRecipe} className="space-y-4">
          <input type="hidden" name="id" value={recipe.id} />

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Title
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              defaultValue={recipe.title}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Category *
            </label>
            <select
              id="edit-category"
              name="category"
              required
              defaultValue={recipe.category || ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Prep Time (minutes)
              </label>
              <input
                id="edit-prep-time"
                name="prep_time_minutes"
                type="number"
                min="0"
                placeholder="15"
                defaultValue={recipe.prep_time_minutes ?? ""}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Cook Time (minutes)
              </label>
              <input
                id="edit-cook-time"
                name="cook_time_minutes"
                type="number"
                min="0"
                placeholder="30"
                defaultValue={recipe.cook_time_minutes ?? ""}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Servings
              </label>
              <input
                id="edit-servings"
                name="servings"
                type="number"
                min="1"
                placeholder="4"
                defaultValue={recipe.servings ?? ""}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={recipe.description || ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Ingredients (one per line)
            </label>
            <textarea
              id="edit-ingredients"
              name="ingredients"
              rows={6}
              required
              defaultValue={ingredientsText}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Steps (one per line)
            </label>
            <textarea
              id="edit-steps"
              name="steps"
              rows={8}
              required
              defaultValue={stepsText}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {imageUrl ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Current Image
              </label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-md border border-neutral-200 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-neutral-600">
                  Upload a new image below to replace this one.
                </p>
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              {imageUrl ? "Replace Image (optional)" : "Image (optional)"}
            </label>
            <input
              id="edit-image"
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Best results: JPG/PNG/WebP. Max 5MB. Leave empty to keep current image.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Notes (optional)
            </label>
            <textarea
              id="edit-notes"
              name="notes"
              rows={3}
              placeholder="Additional notes or comments about this recipe..."
              defaultValue={recipe.notes || ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Tips (optional)
            </label>
            <textarea
              id="edit-tips"
              name="tips"
              rows={3}
              placeholder="Helpful tips for making this recipe..."
              defaultValue={recipe.tips || ""}
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id={`edit-tag-${tag.id}`}
                    name="tags"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(tag.id)}
                    className="rounded border-neutral-300"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">
              Nutritional Information (optional, per serving)
            </h3>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Calories
                </label>
                <input
                  id="edit-calories"
                  name="calories"
                  type="number"
                  min="0"
                  placeholder="250"
                  defaultValue={recipe.calories ?? ""}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Protein (g)
                </label>
                <input
                  id="edit-protein"
                  name="protein_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="20"
                  defaultValue={recipe.protein_grams ?? ""}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Carbs (g)
                </label>
                <input
                  id="edit-carbs"
                  name="carbs_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="30"
                  defaultValue={recipe.carbs_grams ?? ""}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Fat (g)
                </label>
                <input
                  id="edit-fat"
                  name="fat_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="10"
                  defaultValue={recipe.fat_grams ?? ""}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600">
                  Fiber (g)
                </label>
                <input
                  id="edit-fiber"
                  name="fiber_grams"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5"
                  defaultValue={recipe.fiber_grams ?? ""}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input
                id="edit-published"
                name="published"
                type="checkbox"
                defaultChecked={recipe.published}
                className="rounded border-neutral-300"
              />
              <span>Published</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Save Changes
            </button>
            <Link
              href="/admin/dashboard"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
