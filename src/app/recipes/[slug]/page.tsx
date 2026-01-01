import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "id,title,slug,description,ingredients,steps,image_path,published,created_at",
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
          {recipe.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {recipe.description}
            </p>
          ) : null}
        </div>
        <Link
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
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
