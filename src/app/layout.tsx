import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "./admin/categories/actions";
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
      <body className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="group flex items-center gap-3">
                <div className="text-2xl font-bold tracking-tight text-neutral-900">
                  RECIPES
                </div>
              </Link>
              <Link
                href="/admin"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Login
              </Link>
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
                <Link href="/admin" className="hover:text-neutral-900">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
