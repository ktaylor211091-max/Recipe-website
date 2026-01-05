import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";

type FavoriteRecipe = {
  id: string;
  recipe_id: string;
  recipes: {
    id: string;
    title: string;
    slug: string;
    category_id: string;
    description: string | null;
    image_path: string | null;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    categories: {
      name: string;
      slug: string;
    } | null;
  };
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const successMessage =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
        ? sp.success[0]
        : "";

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  const user = userRes.user;

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Get favorite recipes
  const { data: favorites } = await supabase
    .from("favorite_recipes")
    .select(`
      id,
      recipe_id,
      recipes (
        id,
        title,
        slug,
        category_id,
        description,
        image_path,
        prep_time_minutes,
        cook_time_minutes,
        categories (
          name,
          slug
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<FavoriteRecipe[]>();

  return (
    <main>
      {successMessage ? (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
          <p className="mt-2 text-sm text-neutral-600">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Sign Out
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Account Info */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Account Info</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="font-medium text-neutral-700">Email</div>
              <div className="text-neutral-600">{user.email}</div>
            </div>
            <div>
              <div className="font-medium text-neutral-700">Account Type</div>
              <div className="text-neutral-600">
                {profile?.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    User
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="font-medium text-neutral-700">Member Since</div>
              <div className="text-neutral-600">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {profile?.role === "admin" && (
            <div className="mt-6">
              <Link
                href="/admin/dashboard"
                className="block w-full rounded-lg bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Favorite Recipes */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Favorite Recipes ({favorites?.length || 0})
            </h2>
          </div>

          {!favorites || favorites.length === 0 ? (
            <div className="mt-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-neutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="mt-3 text-sm text-neutral-600">
                No favorite recipes yet
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Browse recipes and click the heart icon to save your favorites
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                Browse Recipes
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {favorites.map((fav) => {
                const recipe = fav.recipes;
                const imageUrl = recipe.image_path
                  ? supabase.storage
                      .from("recipe-images")
                      .getPublicUrl(recipe.image_path).data.publicUrl
                  : null;

                return (
                  <Link
                    key={fav.id}
                    href={`/recipes/${recipe.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    {imageUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      {recipe.categories && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                          {recipe.categories.name}
                        </span>
                      )}
                      <h3 className="mt-2 font-semibold text-neutral-900 group-hover:text-emerald-600">
                        {recipe.title}
                      </h3>
                      {recipe.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                          {recipe.description}
                        </p>
                      )}
                      {(recipe.prep_time_minutes || recipe.cook_time_minutes) && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                          {recipe.prep_time_minutes && (
                            <span>Prep: {recipe.prep_time_minutes}m</span>
                          )}
                          {recipe.cook_time_minutes && (
                            <span>Cook: {recipe.cook_time_minutes}m</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
