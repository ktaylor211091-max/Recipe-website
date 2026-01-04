import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PrintButton } from "./PrintButton";
import { ShareButton } from "./ShareButton";
import { IngredientScaler } from "./IngredientScaler";

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
      "id,title,slug,category,description,ingredients,steps,image_path,published,created_at,prep_time_minutes,cook_time_minutes,servings",
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!recipe) {
    notFound();
  }

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
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 shadow-md mb-3">
            <span className="text-xs font-bold text-white">
              {(recipe.category ?? "General").trim() || "General"}
            </span>
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

          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-bold text-neutral-900">Ingredients</h2>
            </div>
            {recipe.ingredients?.length ? (
              <IngredientScaler 
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
    </main>
  );
}
