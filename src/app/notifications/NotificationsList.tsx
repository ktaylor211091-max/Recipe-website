"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } from "@/lib/notifications";

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

type NotificationsListProps = {
  notifications: Notification[];
  currentUserId: string;
};

export function NotificationsList({
  notifications,
  currentUserId,
}: NotificationsListProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [isPending, startTransition] = useTransition();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return "👥";
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "message":
        return "📧";
      case "mention":
        return "@";
      default:
        return "🔔";
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.recipe_id && notification.recipe) {
      return `/recipes/${notification.recipe.slug}`;
    }
    if (notification.from_user_id) {
      return `/profile/${notification.from_user_id}`;
    }
    return "/notifications";
  };

  const handleMarkAsRead = (notificationId: string) => {
    startTransition(async () => {
      await markNotificationAsRead(notificationId);
      setLocalNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    });
  };

  const handleDelete = (notificationId: string) => {
    startTransition(async () => {
      await deleteNotification(notificationId);
      setLocalNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead(currentUserId);
      setLocalNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    });
  };

  const unreadNotifications = localNotifications.filter((n) => !n.is_read);

  return (
    <>
      {unreadNotifications.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
      )}

      {localNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`group rounded-xl border transition-all ${
            notification.is_read
              ? "border-neutral-200 bg-white"
              : "border-emerald-200 bg-emerald-50"
          } p-4 hover:shadow-md`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={getNotificationLink(notification)}
                    className="text-sm font-medium text-neutral-900 hover:text-emerald-600 transition-colors"
                  >
                    {notification.message}
                  </Link>
                  {notification.recipe && (
                    <Link
                      href={`/recipes/${notification.recipe.slug}`}
                      className="block text-xs text-emerald-600 hover:text-emerald-700 mt-1"
                    >
                      {notification.recipe.title}
                    </Link>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()} at{" "}
                    {new Date(notification.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-3 text-sm">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={isPending}
                    className="text-neutral-600 hover:text-emerald-600 font-medium disabled:opacity-50"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  disabled={isPending}
                  className="text-neutral-600 hover:text-red-600 font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
