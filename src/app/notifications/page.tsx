import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationsList } from "./NotificationsList";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  from_user_id: string | null;
  recipe_id: string | null;
  comment_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  from_user?: {
    display_name: string | null;
  };
  recipe?: {
    title: string;
    slug: string;
  };
};

type NotificationRow = Notification & {
  from_user: Notification["from_user"] | Notification["from_user"][] | null;
  recipe: Notification["recipe"] | Notification["recipe"][] | null;
};

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  // Fetch notifications for current user
  const { data: notificationsRaw } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      type,
      from_user_id,
      recipe_id,
      comment_id,
      message,
      is_read,
      created_at,
      from_user:profiles!notifications_from_user_id_fkey(display_name),
      recipe:recipes(title, slug)
    `)
    .eq("user_id", userRes.user.id)
    .order("created_at", { ascending: false });

  // Transform data to handle array responses
  const normalizedRaw = (notificationsRaw ?? []) as NotificationRow[];
  const notifications: Notification[] = normalizedRaw.map((n) => ({
    ...n,
    from_user: Array.isArray(n.from_user) ? n.from_user[0] : n.from_user,
    recipe: Array.isArray(n.recipe) ? n.recipe[0] : n.recipe,
  }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-2 text-sm text-neutral-600">
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            No notifications yet
          </h2>
          <p className="text-neutral-600 mb-6">
            When people interact with your recipes, you&apos;ll see notifications here
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <NotificationsList
            notifications={notifications}
            currentUserId={userRes.user.id}
          />
        </div>
      )}
    </main>
  );
}
