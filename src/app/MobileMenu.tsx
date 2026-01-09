"use client";

import Link from "next/link";
import { useState } from "react";

type User = {
  id: string;
  email?: string;
};

type MobileMenuProps = {
  user: User | null;
  isAdmin: boolean;
};

export function MobileMenu({ user, isAdmin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 md:hidden shadow-lg z-30">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link
                  href="/create-recipe"
                  className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  ✨ Create Recipe
                </Link>
                <Link
                  href="/shopping-list"
                  className="block w-full rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  🛒 Shopping List
                </Link>
                <div className="border-t border-neutral-200 my-2 pt-2">
                  <p className="text-xs font-semibold text-neutral-500 px-4 py-2 uppercase">
                    Community
                  </p>
                  <Link
                    href="/search-users"
                    className="block w-full rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Find Chefs
                  </Link>
                  <Link
                    href="/messages"
                    className="block w-full rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Messages
                  </Link>
                </div>
                <div className="border-t border-neutral-200 my-2 pt-2">
                  <p className="text-xs font-semibold text-neutral-500 px-4 py-2 uppercase">
                    Account
                  </p>
                  <Link
                    href="/account"
                    className="block w-full rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="block w-full rounded-lg px-4 py-3 text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-neutral-300 px-4 py-3 text-center font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
