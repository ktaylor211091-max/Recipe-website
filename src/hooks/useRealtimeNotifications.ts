"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components";

interface RealtimeNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

/**
 * Hook for real-time notification updates via Supabase subscriptions
 * @param userId Current user's ID
 * @returns Current unread notification count
 */
export function useRealtimeNotifications(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();
    
    // Fetch initial count
    const fetchInitialCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      
      if (count !== null) {
        setUnreadCount(count);
      }
    };

    fetchInitialCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as RealtimeNotification;
          setUnreadCount((prev) => prev + 1);
          
          // Show toast notification
          showToast(notification.message || "You have a new notification!", "info");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as RealtimeNotification;
          
          // If notification was marked as read, decrement count
          if (notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showToast]);

  return unreadCount;
}
