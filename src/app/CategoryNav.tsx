"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "./admin/categories/actions";

type CategoryNavProps = {
  categories: Category[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Separate parent categories from subcategories
  const parentCategories = categories.filter((cat) => !cat.parent_category_id);
  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.parent_category_id) {
      if (!acc[cat.parent_category_id]) {
        acc[cat.parent_category_id] = [];
      }
      acc[cat.parent_category_id].push(cat);
    }
    return acc;
  }, {} as Record<string, Category[]>);

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
          const subcategories = subcategoriesMap[cat.id] || [];
          const hasSubcategories = subcategories.length > 0;

          if (hasSubcategories) {
            return (
              <div
                key={cat.id}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(cat.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 touch-manipulation flex items-center gap-1"
                >
                  {cat.name}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
                {openDropdown === cat.id && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 min-w-[200px]">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${sub.slug}`}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 touch-manipulation"
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
