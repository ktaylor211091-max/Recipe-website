import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FollowButton } from "./FollowButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  const { data: userRes } = await supabase.auth.getUser();
  const currentUserId = userRes?.user?.id;

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = currentUserId === id;

  // Get stats
  const [recipesData, followersData, followingData, isFollowing] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, title, slug, image_path, created_at, prep_time_minutes, cook_time_minutes, servings, published")
      .eq("author_id", id)
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_follows")
      .select("follower_id")
      .eq("following_id", id),
    supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", id),
    currentUserId && currentUserId !== id
      ? supabase
          .from("user_follows")
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const recipes = recipesData.data || [];
  const followerCount = followersData.data?.length || 0;
  const followingCount = followingData.data?.length || 0;

  return (
    <main>
      {/* Profile Header */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl font-bold text-white">
              {(profile.display_name || "U")[0].toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-neutral-900">
                {profile.display_name || "Anonymous Chef"}
              </h1>
              <p className="text-sm text-neutral-500">@{profile.display_name?.toLowerCase().replace(/\s+/g, '') || id.slice(0, 8)}</p>
              
              {profile.bio && (
                <p className="mt-3 text-neutral-700 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {(profile.location || profile.website) && (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="font-bold text-neutral-900">{recipes.length}</span>{" "}
                  <span className="text-neutral-600">recipes</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900">{followerCount}</span>{" "}
                  <span className="text-neutral-600">followers</span>
                </div>
                <div>
                  <span className="font-bold text-neutral-900">{followingCount}</span>{" "}
                  <span className="text-neutral-600">following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Link
                href="/account/edit"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Edit Profile
              </Link>
            ) : currentUserId ? (
              <>
                <FollowButton
                  userId={id}
                  initialIsFollowing={!!isFollowing.data}
                />
                <Link
                  href={`/messages?user=${id}`}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Message
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* User's Recipes */}
      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            {isOwnProfile ? "My Recipes" : "Recipes"}
          </h2>
          {isOwnProfile && (
            <Link
              href="/create-recipe"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              + Create Recipe
            </Link>
          )}
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
            <div className="text-5xl mb-4">🍳</div>
            <p className="text-lg font-medium text-neutral-700">
              {isOwnProfile ? "You haven't created any recipes yet" : "No recipes yet"}
            </p>
            {isOwnProfile && (
              <Link
                href="/create-recipe"
                className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => {
              const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
              const imageUrl = recipe.image_path
                ? supabase.storage.from("recipe-images").getPublicUrl(recipe.image_path).data.publicUrl
                : null;

              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden bg-neutral-100 aspect-[4/3]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <div className="text-6xl">🍳</div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {recipe.title}
                    </h3>

                    {totalTime > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {totalTime} min
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
