import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Website",
  description: "A simple recipe website with an admin uploader.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-orange-50/30">
        <header className="sticky top-0 z-50 border-b border-orange-200/50 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="text-3xl font-bold tracking-tighter text-orange-600 transition-all group-hover:scale-105">
                RECIPES
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Browse
              </Link>
              <Link
                href="/admin"
                className="rounded-full bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
        </main>

        <footer className="border-t border-orange-200/50 bg-orange-50/50 mt-auto">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tighter text-orange-600 mb-2">
                  RECIPES
                </div>
                <p className="text-sm text-neutral-500">
                  Your personal recipe collection
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  Home
                </Link>
                <Link
                  href="/admin"
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
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
