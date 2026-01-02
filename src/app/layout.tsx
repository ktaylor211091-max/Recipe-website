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
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-indigo-200/50 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white shadow-lg backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link href="/" className="group flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2 transition-all group-hover:bg-white/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Recipe Collection</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg px-4 py-2.5 font-medium text-white/90 transition-all hover:bg-white/15 hover:text-white"
              >
                Home
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
        </main>

        <footer className="border-t border-neutral-200 bg-gradient-to-r from-neutral-50 to-indigo-50/30 mt-auto">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-600 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-medium">Recipe Collection</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500">Built with Next.js & Supabase</span>
            </div>
            <Link 
              href="/admin" 
              className="text-xs text-neutral-400 transition-colors hover:text-indigo-600"
            >
              Admin Access
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
