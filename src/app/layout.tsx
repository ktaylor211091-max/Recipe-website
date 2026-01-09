import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "./admin/categories/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CategoryNav } from "./CategoryNav";
import { NotificationBell } from "./NotificationBell";
import { MobileMenu } from "./MobileMenu";
import { FloatingActionButton } from "./FloatingActionButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Website",
  description: "A simple recipe website with an admin uploader.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  // Check if user is logged in
  const supabase = await createSupabaseServerClient();
  let user = null;
  let isAdmin = false;
  let unreadNotificationCount = 0;

  if (supabase) {
    const { data: userRes } = await supabase.auth.getUser();
    user = userRes?.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = profile?.role === "admin";

      // Get unread notification count
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      unreadNotificationCount = count || 0;
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white pb-16 md:pb-0">
        <header className="relative z-50 border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="group flex items-center gap-3">
                <div className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">
                  RECIPES
                </div>
              </Link>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <NotificationBell initialUnreadCount={unreadNotificationCount} />
                    <Link
                      href="/search-users"
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Find Chefs
                    </Link>
                    <Link
                      href="/messages"
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Messages
                    </Link>
                    <Link
                      href="/activity"
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Activity
                    </Link>
                    <Link
                      href="/account"
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Account
                    </Link>
                    <Link
                      href="/create-recipe"
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                      ✨ Create Recipe
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              {/* Mobile Menu */}
              <MobileMenu user={user} isAdmin={isAdmin} />
            </div>
            <CategoryNav categories={categories} />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        {user ? (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white">
            <div className="grid grid-cols-5 h-16">
              <Link
                href="/search-users"
                className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-emerald-600 active:bg-neutral-50 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-medium">Find Chefs</span>
              </Link>
              <Link
                href="/messages"
                className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-emerald-600 active:bg-neutral-50 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium">Messages</span>
              </Link>
              <Link
                href="/notifications"
                className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-emerald-600 active:bg-neutral-50 transition-colors relative"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
                <span className="text-xs font-medium">Alerts</span>
              </Link>
              <Link
                href="/activity"
                className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-emerald-600 active:bg-neutral-50 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium">Activity</span>
              </Link>
              <Link
                href="/account"
                className="flex flex-col items-center justify-center gap-1 text-neutral-600 hover:text-emerald-600 active:bg-neutral-50 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium">Account</span>
              </Link>
            </div>
          </nav>
        ) : (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white">
            <div className="flex h-16 items-center justify-around px-4">
              <Link
                href="/login"
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium text-neutral-700 transition-colors active:bg-neutral-50"
              >
                Sign In
              </Link>
              <div className="w-3"></div>
              <Link
                href="/signup"
                className="flex-1 rounded-md bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white transition-colors active:bg-emerald-700"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        )}

        <footer className="border-t border-neutral-200 bg-neutral-50 mt-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-bold text-neutral-900 mb-1">
                  RECIPES
                </div>
                <p className="text-sm text-neutral-500">
                  Your personal recipe collection
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-600">
                <Link href="/" className="hover:text-neutral-900">
                  Home
                </Link>
                {user ? (
                  <Link href="/account" className="hover:text-neutral-900">
                    My Account
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-neutral-900">
                      Sign In
                    </Link>
                    <Link href="/signup" className="hover:text-neutral-900">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Action Button - Logged in users */}
        {user && <FloatingActionButton userId={user.id} />}
      </body>
    </html>
  );
}