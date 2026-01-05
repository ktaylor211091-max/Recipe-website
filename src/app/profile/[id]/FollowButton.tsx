"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function FollowButton({ userId, initialIsFollowing }: { userId: string; initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = async () => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      if (isFollowing) {
        // Unfollow
        await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        setIsFollowing(false);
      } else {
        // Follow
        await supabase
          .from("user_follows")
          .insert({
            follower_id: user.id,
            following_id: userId,
          });
        setIsFollowing(true);
      }
    });
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
        isFollowing
          ? "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
          : "bg-emerald-600 text-white hover:bg-emerald-500"
      }`}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
}
