import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PrintButton } from "./PrintButton";

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
    <main>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{recipe.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
              {(recipe.category ?? "General").trim() || "General"}
            </div>
          </div>
          {recipe.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {recipe.description}
            </p>
          ) : null}

          {(recipe.prep_time_minutes || recipe.cook_time_minutes || recipe.servings) ? (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-700">
              {recipe.prep_time_minutes ? (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Prep:</span> {recipe.prep_time_minutes} min
                </div>
              ) : null}
              {recipe.cook_time_minutes ? (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="font-medium">Cook:</span> {recipe.cook_time_minutes} min
                </div>
              ) : null}
              {recipe.servings ? (
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">Servings:</span> {recipe.servings}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2 print:hidden">
          <PrintButton />
          <Link
            className="rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            href="/"
          >
            Back
          </Link>
        </div>
      </div>

      {imageUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Ingredients</h2>
        {recipe.ingredients?.length ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700">
            {recipe.ingredients.map((item: string, i: number) => (
              <li key={`${i}-${item}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">No ingredients yet.</p>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Steps</h2>
        {recipe.steps?.length ? (
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-neutral-700">
            {recipe.steps.map((step: string, i: number) => (
              <li key={`${i}-${step}`}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">No steps yet.</p>
        )}
      </section>
    </main>
  );
}
