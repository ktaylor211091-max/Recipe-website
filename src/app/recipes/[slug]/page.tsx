import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PrintButton } from "./PrintButton";
import { ShareButton } from "./ShareButton";
import { IngredientScalerWithShopping } from "./IngredientScalerWithShopping";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <main>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Supabase not configured
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Set the required Vercel environment variables and redeploy.
          </p>
          <div className="mt-4">
            <Link className="underline" href="/">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "id,title,slug,category,description,ingredients,steps,image_path,published,created_at,prep_time_minutes,cook_time_minutes,servings,notes,tips,calories,protein_grams,carbs_grams,fat_grams,fiber_grams",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!recipe) {
    notFound();
  }

  // Fetch tags for this recipe
  const { data: recipeTags } = await supabase
    .from("recipe_tags")
    .select("tag_id, tags(name, slug)")
    .eq("recipe_id", recipe.id);

  const tags = recipeTags?.map((rt: any) => rt.tags).filter(Boolean) || [];

  const imageUrl = recipe.image_path
    ? supabase.storage
        .from("recipe-images")
        .getPublicUrl(recipe.image_path).data.publicUrl
    : null;

  return (
    <main className="animate-fade-in">
      {/* Header with actions */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 shadow-md">
              <span className="text-xs font-bold text-white">
                {(recipe.category ?? "General").trim() || "General"}
              </span>
            </div>
            {tags.length > 0 && (
              <>
                {tags.map((tag: any) => (
                  <span 
                    key={tag.slug} 
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            {recipe.title}
          </h1>
          {recipe.description ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-neutral-600">
              {recipe.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <PrintButton />
          <Link
            className="rounded-xl border-2 border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md"
            href="/"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Share buttons */}
      <div className="mb-6 print:hidden">
        <ShareButton title={recipe.title} slug={recipe.slug} />
      </div>

      {/* Metadata cards */}
      {(recipe.prep_time_minutes || recipe.cook_time_minutes || recipe.servings) ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {recipe.prep_time_minutes ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Prep Time</div>
                  <div className="text-xl font-bold text-neutral-900">{recipe.prep_time_minutes} min</div>
                </div>
              </div>
            </div>
          ) : null}
          {recipe.cook_time_minutes ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                  <svg className="h-6 w-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Cook Time</div>
                  <div className="text-xl font-bold text-neutral-900">{recipe.cook_time_minutes} min</div>
                </div>
              </div>
            </div>
          ) : null}
          {recipe.servings ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Servings</div>
                  <div className="text-xl font-bold text-neutral-900">{recipe.servings}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Two-column layout for desktop */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Image and Ingredients */}
        <div className="space-y-6 lg:col-span-1">
          {imageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
              <img
                src={imageUrl}
                alt={recipe.title}
                className="h-auto w-full"
              />
            </div>
          ) : null}

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ingredients</h2>
            </div>
            {recipe.ingredients?.length ? (
              <IngredientScalerWithShopping 
                initialServings={recipe.servings || 1}
                ingredients={recipe.ingredients}
              />
            ) : (
              <p className="text-sm text-neutral-500">No ingredients yet.</p>
            )}
          </section>
        </div>

        {/* Right column - Steps */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md lg:col-span-2">
          <div className="mb-6 flex items-center gap-2">
            <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-neutral-900">Instructions</h2>
          </div>
          {recipe.steps?.length ? (
            <ol className="space-y-6">
              {recipe.steps.map((step: string, i: number) => (
                <li key={`${i}-${step}`} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-bold text-white shadow-md">
                    {i + 1}
                  </div>
                  <p className="flex-1 pt-1.5 text-base leading-relaxed text-neutral-700">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-500">No steps yet.</p>
          )}
        </section>
      </div>

      {/* Nutritional Information */}
      {(recipe.calories || recipe.protein_grams || recipe.carbs_grams || recipe.fat_grams || recipe.fiber_grams) && (
        <div className="mt-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold text-neutral-900">Nutrition Facts</h2>
              <span className="text-sm text-neutral-500">(per serving)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-5">
              {recipe.calories && (
                <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Calories</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.calories}</div>
                </div>
              )}
              {recipe.protein_grams && (
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Protein</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.protein_grams}g</div>
                </div>
              )}
              {recipe.carbs_grams && (
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Carbs</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.carbs_grams}g</div>
                </div>
              )}
              {recipe.fat_grams && (
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Fat</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.fat_grams}g</div>
                </div>
              )}
              {recipe.fiber_grams && (
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Fiber</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.fiber_grams}g</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes and Tips */}
      {(recipe.notes || recipe.tips) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {recipe.notes && (
            <div className="rounded-2xl border border-neutral-200 bg-amber-50 p-6 shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <h2 className="text-lg font-bold text-neutral-900">Notes</h2>
              </div>
              <p className="text-base leading-relaxed text-neutral-700 whitespace-pre-line">
                {recipe.notes}
              </p>
            </div>
          )}
          {recipe.tips && (
            <div className="rounded-2xl border border-neutral-200 bg-sky-50 p-6 shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-bold text-neutral-900">Tips</h2>
              </div>
              <p className="text-base leading-relaxed text-neutral-700 whitespace-pre-line">
                {recipe.tips}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
