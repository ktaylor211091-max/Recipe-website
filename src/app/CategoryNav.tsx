"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "./admin/categories/actions";

type CategoryNavProps = {
  categories: Category[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const parentCategories = categories.filter((cat) => !cat.parent_category_id);

  const getSubcategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent_category_id === parentId);
  };

  return (
    <nav className="relative z-50 border-t border-neutral-100 py-3 -mx-4 md:mx-0">
      <div className="flex items-center gap-4 md:gap-6 overflow-x-auto px-4 md:px-0 scrollbar-hide">
      <Link
        href="/"
        className="whitespace-nowrap text-sm font-medium text-neutral-900 hover:text-neutral-600 touch-manipulation"
      >
        All Recipes
      </Link>
      {parentCategories.map((cat) => {
        const subcategories = getSubcategories(cat.id);
        const hasSubcategories = subcategories.length > 0;

        return (
          <div
            key={cat.id}
            className="relative z-50"
            onMouseEnter={() => hasSubcategories && setOpenDropdown(cat.id)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <Link
              href={`/#${cat.slug}`}
              className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 touch-manipulation"
            >
              {cat.name}
              {hasSubcategories && (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </Link>

            {hasSubcategories && openDropdown === cat.id && (
              <div className="absolute left-0 top-full z-[9999] mt-1 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg">
                <div className="py-2">
                  <Link
                    href={`/#${cat.slug}`}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    All {cat.name}
                  </Link>
                  <div className="my-1 border-t border-neutral-100"></div>
                  {subcategories.map((subcat) => (
                    <Link
                      key={subcat.id}
                      href={`/#${subcat.slug}`}
                      className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      {subcat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </nav>
  );
}
