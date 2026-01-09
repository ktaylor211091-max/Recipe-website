"use client";

import Link from "next/link";
import { useState } from "react";

type FloatingActionButtonProps = {
  userId?: string | null;
};

export function FloatingActionButton({ userId }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!userId) return null;

  return (
    <>
      {/* FAB Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <Link
            href="/shopping-list"
            className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-shadow hover:bg-neutral-50"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">🛒</span>
            <span className="text-sm font-medium text-neutral-700">Shopping List</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-shadow hover:bg-neutral-50"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-xl">👤</span>
            <span className="text-sm font-medium text-neutral-700">My Profile</span>
          </Link>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center min-h-[56px] min-w-[56px]"
        aria-label="Quick actions"
        aria-expanded={isOpen}
      >
        {isOpen ? (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </button>

      {/* Primary CTA: Create Recipe */}
      <Link
        href="/create-recipe"
        className="fixed bottom-6 left-6 right-6 z-40 md:hidden bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-6 py-3 font-semibold text-center transition-colors shadow-lg hover:shadow-xl active:scale-95"
      >
        ✨ Create Recipe
      </Link>
    </>
  );
}
