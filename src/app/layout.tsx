import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "./admin/categories/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="group flex items-center gap-3">
                <div className="text-2xl font-bold tracking-tight text-neutral-900">
                  RECIPES
                </div>
              </Link>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
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
                      href={`/profile/${user.id}`}
                      className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/create-recipe"
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                      Create Recipe
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
            </div>
            <nav className="flex items-center gap-6 border-t border-neutral-100 py-3 overflow-x-auto">
              <Link
                href="/"
                className="whitespace-nowrap text-sm font-medium text-neutral-900 hover:text-neutral-600"
              >
                All Recipes
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/#${cat.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>

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
      </body>
    </html>
  );
}
