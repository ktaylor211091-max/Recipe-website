import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategories } from "@/app/admin/categories/actions";
import { Breadcrumb } from "@/app/Breadcrumb";
import { EmptyState } from "@/app/EmptyState";
import { SUPABASE_CONFIG } from "@/lib/supabase/config";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return <div>Database not configured</div>;
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Fetch recipes in this category
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, slug, category, description, image_path, prep_time_minutes, cook_time_minutes, servings, created_at")
    .eq("category", category.name)
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: category.name }]} />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">
          {category.name}
        </h1>
        <p className="text-lg text-neutral-600">
          {recipes?.length || 0} {recipes?.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      {!recipes || recipes.length === 0 ? (
        <EmptyState
          illustration="category"
          title={`No ${category.name.toLowerCase()} recipes yet`}
          description={`Be the first to share a delicious ${category.name.toLowerCase()} recipe with the community!`}
          actionLabel="Create Recipe"
          actionHref="/create-recipe"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
            const imageUrl = recipe.image_path
              ? `${SUPABASE_CONFIG.url}/storage/v1/object/public/recipe-images/${recipe.image_path}`
              : null;

            return (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-neutral-100 aspect-[4/3]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <div className="text-6xl">🍳</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>

                  {recipe.description && (
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  )}

                  {(totalTime > 0 || recipe.servings) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                      {totalTime > 0 && (
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">{totalTime} min</span>
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="flex items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">{recipe.servings} servings</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
