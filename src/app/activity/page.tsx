import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Activity = {
  id: string;
  user_id: string;
  activity_type: string;
  recipe_id: string | null;
  target_user_id: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
  recipes: {
    title: string;
    slug: string;
  } | null;
  target_profiles: {
    display_name: string | null;
  } | null;
};

export default async function ActivityFeedPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  // Get list of users the current user follows
  const { data: following } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", userRes.user.id);

  const followingIds = following?.map((f) => f.following_id) || [];

  // Get activities from followed users
  const { data: activitiesRaw, error: activitiesError } = await supabase
    .from("activities")
    .select(`
      id,
      user_id,
      activity_type,
      recipe_id,
      target_user_id,
      created_at,
      profiles (display_name),
      recipes (title, slug),
      target_profiles:profiles!activities_target_profile_fk (display_name)
    `)
    .in("user_id", followingIds.length > 0 ? [...followingIds, userRes.user.id] : [userRes.user.id])
    .order("created_at", { ascending: false })
    .limit(50);

  if (activitiesError) {
    console.error("Error fetching activities:", activitiesError);
  }

  // Transform the data to match our Activity type
  const activities: Activity[] = (activitiesRaw || []).map((a: any) => ({
    id: a.id,
    user_id: a.user_id,
    activity_type: a.activity_type,
    recipe_id: a.recipe_id,
    target_user_id: a.target_user_id,
    created_at: a.created_at,
    profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles,
    recipes: Array.isArray(a.recipes) ? a.recipes[0] : a.recipes,
    target_profiles: Array.isArray(a.target_profiles) ? a.target_profiles[0] : a.target_profiles,
  }));

  const getActivityText = (activity: Activity) => {
    const userName = activity.profiles?.display_name || "Someone";
    const recipeName = activity.recipes?.title || "a recipe";
    const targetUserName = activity.target_profiles?.display_name || "someone";

    switch (activity.activity_type) {
      case "recipe_created":
        return { text: `created`, highlight: recipeName, link: `/recipes/${activity.recipes?.slug}` };
      case "recipe_forked":
        return { text: `forked`, highlight: recipeName, link: `/recipes/${activity.recipes?.slug}` };
      case "recipe_favorited":
        return { text: `favorited`, highlight: recipeName, link: `/recipes/${activity.recipes?.slug}` };
      case "comment_posted":
        return { text: `commented on`, highlight: recipeName, link: `/recipes/${activity.recipes?.slug}` };
      case "user_followed":
        return { text: `started following`, highlight: targetUserName, link: `/profile/${activity.target_user_id}` };
      default:
        return { text: activity.activity_type, highlight: "", link: "/" };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "recipe_created":
        return "✨";
      case "recipe_forked":
        return "🍴";
      case "recipe_favorited":
        return "⭐";
      case "comment_posted":
        return "💬";
      case "user_followed":
        return "👥";
      default:
        return "📌";
    }
  };

  return (
    <main>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Activity Feed</h1>
          <p className="mt-2 text-neutral-600">See what your network is cooking</p>
        </div>
        <Link
          href="/create-recipe"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          + Create Recipe
        </Link>
      </div>

      {followingIds.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Your feed is empty
          </h2>
          <p className="text-neutral-600 mb-6">
            Follow other cooks to see their activities here
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Browse Recipes
          </Link>
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => {
            const { text, highlight, link } = getActivityText(activity);
            const userName = activity.profiles?.display_name || "Someone";
            const isOwnActivity = activity.user_id === userRes.user.id;

            return (
              <div
                key={activity.id}
                className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl font-bold text-white">
                    {userName[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-neutral-700">
                        <Link
                          href={`/profile/${activity.user_id}`}
                          className="font-semibold text-neutral-900 hover:text-emerald-600"
                        >
                          {isOwnActivity ? "You" : userName}
                        </Link>{" "}
                        {text}{" "}
                        <Link
                          href={link}
                          className="font-semibold text-emerald-600 hover:underline"
                        >
                          {highlight}
                        </Link>
                      </p>
                      <span className="text-2xl" title={activity.activity_type}>
                        {getActivityIcon(activity.activity_type)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-neutral-600">No activities yet. Start cooking!</p>
        </div>
      )}
    </main>
  );
}
