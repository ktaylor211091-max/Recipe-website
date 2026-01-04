import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "./admin/categories/actions";
import { DarkModeToggle } from "./DarkModeToggle";
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

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="group flex items-center gap-3">
                <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  RECIPES
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <DarkModeToggle />
                <Link
                  href="/admin"
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  Admin
                </Link>
              </div>
            </div>
            <nav className="flex items-center gap-6 border-t border-neutral-100 py-3 overflow-x-auto dark:border-neutral-700">
              <Link
                href="/"
                className="whitespace-nowrap text-sm font-medium text-neutral-900 hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
              >
                All Recipes
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/#${cat.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 bg-white dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>

        <footer className="border-t border-neutral-200 bg-neutral-50 mt-auto dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-bold text-neutral-900 mb-1 dark:text-white">
                  RECIPES
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your personal recipe collection
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                  Home
                </Link>
                <Link href="/admin" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
