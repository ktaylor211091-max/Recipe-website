"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActivityType =
  | "recipe_created"
  | "recipe_forked"
  | "recipe_favorited"
  | "comment_posted"
  | "user_followed";

type CreateActivityParams = {
  userId: string;
  activityType: ActivityType;
  recipeId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
};

export async function createActivity({
  userId,
  activityType,
  recipeId,
  targetUserId,
  metadata,
}: CreateActivityParams) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: "Supabase client not available" };

    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      activity_type: activityType,
      recipe_id: recipeId || null,
      target_user_id: targetUserId || null,
      metadata: metadata || null,
    });

    if (error) {
      console.error("Error creating activity:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createActivity:", error);
    return { error: "Failed to create activity" };
  }
}
