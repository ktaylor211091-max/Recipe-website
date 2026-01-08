"use client";

import Link from "next/link";
import type { Category } from "./admin/categories/actions";

type CategoryNavProps = {
  categories: Category[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <nav className="relative z-50 border-t border-neutral-100 py-3 -mx-4 md:mx-0">
      <div className="flex items-center gap-4 md:gap-6 overflow-x-auto px-4 md:px-0 scrollbar-hide">
        <Link
          href="/"
          className="whitespace-nowrap text-sm font-medium text-neutral-900 hover:text-neutral-600 touch-manipulation"
        >
          All Recipes
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/#${cat.slug}`}
            className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 touch-manipulation"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
