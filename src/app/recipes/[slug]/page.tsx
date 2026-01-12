import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/layout";
import { Button } from "@/components";
import { RecipePrintButton } from "./RecipePrintButton";
import { ShareButton } from "./ShareButton";
import { IngredientScalerWithShopping } from "./IngredientScalerWithShopping";
import { FavoriteButton } from "./FavoriteButton";
import { RecipeReviews } from "./RecipeReviews";
import { RecipeComments } from "./RecipeComments";
import { ForkButton } from "./ForkButton";

type Props = {
  params: Promise<{ slug: string }>;
};

type RecipeTag = {
  name: string;
  slug: string;
};

type RecipeTagRow = {
  tags: RecipeTag | RecipeTag[] | null;
};

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

type ForkRow = {
  recipes:
    | {
        id: string;
        title: string;
        slug: string;
        author_id: string;
        profiles?: { display_name: string | null } | { display_name: string | null }[] | null;
      }
    | {
        id: string;
        title: string;
        slug: string;
        author_id: string;
        profiles?: { display_name: string | null } | { display_name: string | null }[] | null;
      }[]
    | null;
  forked_recipe_id?: string;
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
      "id,title,slug,category,description,ingredients,steps,image_path,published,created_at,prep_time_minutes,cook_time_minutes,servings,notes,tips,calories,protein_grams,carbs_grams,fat_grams,fiber_grams,author_id",
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

  const tags = (recipeTags ?? [])
    .map((rt: RecipeTagRow) => {
      const tag = Array.isArray(rt.tags) ? rt.tags[0] : rt.tags;
      return tag;
    })
    .filter(Boolean) as RecipeTag[];

  // Check if current user has favorited this recipe and get reviews
  const { data: userRes } = await supabase.auth.getUser();
  const isAuthor = userRes?.user?.id === recipe.author_id;
  let isFavorite = false;
  let userReview = null;
  
  if (userRes?.user) {
    const { data: favoriteData } = await supabase
      .from("favorite_recipes")
      .select("id")
      .eq("user_id", userRes.user.id)
      .eq("recipe_id", recipe.id)
      .maybeSingle();
    isFavorite = !!favoriteData;

    // Get user's review
    const { data: reviewData } = await supabase
      .from("recipe_reviews")
      .select("*")
      .eq("user_id", userRes.user.id)
      .eq("recipe_id", recipe.id)
      .maybeSingle();
    userReview = reviewData;
  }

  // Get all reviews and average rating
  const { data: reviews } = await supabase
    .from("recipe_reviews")
    .select("*")
    .eq("recipe_id", recipe.id)
    .order("created_at", { ascending: false });

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Get comments for this recipe
  const { data: commentsRaw } = await supabase
    .from("recipe_comments")
    .select(`
      id,
      user_id,
      content,
      created_at,
      parent_comment_id,
      profiles (display_name)
    `)
    .eq("recipe_id", recipe.id)
    .order("created_at", { ascending: false });

  // Transform comments to match type
  const comments = (commentsRaw || []).map((c: CommentRow) => ({
    ...c,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
  }));

  // Check if this is a fork and get fork info
  const { data: forkInfo } = await supabase
    .from("recipe_forks")
    .select("original_recipe_id, recipes!recipe_forks_original_recipe_id_fkey(id, title, slug)")
    .eq("forked_recipe_id", recipe.id)
    .maybeSingle();

  // Get all forks of this recipe
  const { data: forks } = await supabase
    .from("recipe_forks")
    .select("forked_recipe_id, recipes!recipe_forks_forked_recipe_id_fkey(id, title, slug, author_id, profiles!recipes_author_id_fkey(display_name))")
    .eq("original_recipe_id", recipe.id);

  const originalRecipe = forkInfo?.recipes ? (Array.isArray(forkInfo.recipes) ? forkInfo.recipes[0] : forkInfo.recipes) : null;
  const recipeForks = (forks ?? [])
    .map((f: ForkRow) => {
      const recipeData = Array.isArray(f.recipes) ? f.recipes[0] : f.recipes;
      const profileData = Array.isArray(recipeData?.profiles)
        ? recipeData.profiles[0]
        : recipeData?.profiles;
      if (!recipeData) return null;
      return {
        ...recipeData,
        author_name: profileData?.display_name || "Anonymous Chef",
      };
    })
    .filter((fork): fork is NonNullable<typeof fork> => fork !== null);


  const imageUrl = recipe.image_path
    ? supabase.storage
        .from("recipe-images")
        .getPublicUrl(recipe.image_path).data.publicUrl
    : null;

  return (
    <main className="animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: recipe.category || "Recipes", href: recipe.category ? `/category/${recipe.category.toLowerCase().replace(/\s+/g, "-")}` : "/recipes" },
          { label: recipe.title },
        ]}
      />

      {/* Header with actions */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1">
              <span className="text-xs font-bold text-neutral-700">
                {(recipe.category ?? "General").trim() || "General"}
              </span>
            </div>
            {tags.length > 0 && (
              <>
                {tags.map((tag) => (
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
          {originalRecipe && (
            <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 px-4 py-2 inline-flex items-center gap-2">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm text-purple-700">
                Forked from{" "}
                <Link href={`/recipes/${originalRecipe.slug}`} className="font-semibold hover:underline">
                  {originalRecipe.title}
                </Link>
              </span>
            </div>
          )}
          {recipe.description ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-neutral-600">
              {recipe.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2 print:hidden flex-wrap">
          <FavoriteButton recipeId={recipe.id} initialIsFavorite={isFavorite} />
          {userRes?.user && (
            <ForkButton recipeId={recipe.id} recipeTitle={recipe.title} />
          )}
          <RecipePrintButton
            recipe={{
              title: recipe.title,
              description: recipe.description,
              category: recipe.category,
              prep_time_minutes: recipe.prep_time_minutes,
              cook_time_minutes: recipe.cook_time_minutes,
              servings: recipe.servings,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
            }}
          />
          {isAuthor && (
            <Button variant="amber" size="md" asChild>
              <Link href={`/recipes/edit/${recipe.id}`}>
                Edit
              </Link>
            </Button>
          )}
          <Button variant="indigo" size="md" asChild>
            <Link href="/">
              Back
            </Link>
          </Button>
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
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
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
              <IngredientScalerWithShopping 
                initialServings={recipe.servings || 1}
                ingredients={recipe.ingredients}
                recipeTitle={recipe.title}
                recipeSlug={recipe.slug}
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-lg font-bold text-white">
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
      {(recipe.calories != null || recipe.protein_grams != null || recipe.carbs_grams != null || recipe.fat_grams != null || recipe.fiber_grams != null) && (
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
              {recipe.calories != null && (
                <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Calories</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.calories}</div>
                </div>
              )}
              {recipe.protein_grams != null && (
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Protein</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.protein_grams}g</div>
                </div>
              )}
              {recipe.carbs_grams != null && (
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Carbs</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.carbs_grams}g</div>
                </div>
              )}
              {recipe.fat_grams != null && (
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                  <div className="text-sm font-medium text-neutral-600">Fat</div>
                  <div className="text-2xl font-bold text-neutral-900">{recipe.fat_grams}g</div>
                </div>
              )}
              {recipe.fiber_grams != null && (
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

      {/* Reviews Section */}
      <div className="mt-6">
        <RecipeReviews
          recipeId={recipe.id}
          reviews={reviews || []}
          averageRating={averageRating}
          userReview={userReview}
          isAuthenticated={!!userRes?.user}
        />
      </div>

      {/* Recipe Forks */}
      {recipeForks.length > 0 && (
        <div className="mt-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-neutral-900">
              Variations ({recipeForks.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipeForks.map((fork) => (
                <Link
                  key={fork.id}
                  href={`/recipes/${fork.slug}`}
                  className="group rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-purple-300 hover:bg-purple-50 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-sm font-bold text-white">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                        {fork.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">by {fork.author_name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-6">
        <RecipeComments
          recipeId={recipe.id}
          comments={comments}
          currentUserId={userRes?.user?.id || null}
          recipeAuthorId={recipe.author_id}
          recipeName={recipe.title}
        />
      </div>
    </main>
  );
}
