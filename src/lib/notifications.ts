"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type NotificationType = "follow" | "comment" | "like" | "message" | "mention";

type CreateNotificationParams = {
  userId: string;
  type: NotificationType;
  message: string;
  fromUserId?: string;
  recipeId?: string;
  commentId?: string;
};

export async function createNotification({
  userId,
  type,
  message,
  fromUserId,
  recipeId,
  commentId,
}: CreateNotificationParams) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: "Supabase client not available" };

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      from_user_id: fromUserId || null,
      recipe_id: recipeId || null,
      comment_id: commentId || null,
      message,
      is_read: false,
    });

    if (error) {
      console.error("Error creating notification:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createNotification:", error);
    return { error: "Failed to create notification" };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: "Supabase client not available" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return { error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: "Supabase client not available" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return { error: "Failed to mark all as read" };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: "Supabase client not available" };

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return { error: "Failed to delete notification" };
  }
}
