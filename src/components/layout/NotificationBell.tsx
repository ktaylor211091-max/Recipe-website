"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  actor_name?: string;
  recipe_title?: string;
  target_id?: string;
};

type NotificationBellProps = {
  initialUnreadCount: number;
};

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Subscribe to new notifications
    const channel = supabase
      .channel("user_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          setUnreadCount((prev) => prev + 1);
          loadNotifications();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        () => {
          setUnreadCount((prev) => Math.max(0, prev - 1));
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    const supabase = createSupabaseBrowserClient();
    setLoading(true);
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      loadNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "message":
        return "✉️";
      case "rating":
        return "⭐";
      default:
        return "📬";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "comment":
        return "bg-blue-50 border-blue-200";
      case "follow":
        return "bg-purple-50 border-purple-200";
      case "message":
        return "bg-green-50 border-green-200";
      case "rating":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 flex items-center gap-2"
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h3 className="font-bold text-neutral-900">Notifications</h3>
            <Link
              href="/notifications"
              className="text-xs text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-neutral-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`border-l-4 border-transparent p-3 cursor-pointer transition-colors hover:bg-neutral-50 ${
                      notif.read ? "opacity-75" : "bg-blue-50 border-l-blue-600"
                    }`}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-900 font-medium">
                          {notif.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-3">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Go to Notifications Center
            </Link>
          </div>
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
