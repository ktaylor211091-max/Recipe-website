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
      <body>
        <header className="border-b border-indigo-200 bg-gradient-to-r from-indigo-600 to-sky-600 text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              Recipe Website
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-white/90 hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-white/90 hover:bg-white/10"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>

        <footer className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-neutral-600">
            Built with Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}
