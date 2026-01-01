import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      "id,title,slug,category,description,ingredients,steps,image_path,published,created_at",
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
      <div className="flex items-end justify-between gap-4">
        <div>
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
        </div>
        <Link
          className="rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          href="/"
        >
          Back
        </Link>
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
