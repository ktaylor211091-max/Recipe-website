"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { Category } from "@/app/admin/categories/actions";

type CategoryNavProps = {
  categories: Category[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnter = (catId: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpenDropdown(catId);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav className="relative z-50 border-t border-neutral-100 py-3 -mx-4 md:mx-0">
      <div className="flex items-center gap-4 md:gap-6 overflow-x-auto md:overflow-visible px-4 md:px-0 scrollbar-hide">
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
                className="relative group flex items-center"
                onMouseEnter={() => handleMouseEnter(cat.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 touch-manipulation"
                >
                  {cat.name}
                </Link>
                <button
                  type="button"
                  aria-expanded={openDropdown === cat.id}
                  aria-haspopup="menu"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDropdown((prev) => (prev === cat.id ? null : cat.id));
                  }}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${openDropdown === cat.id ? "rotate-180" : "rotate-0"}`}
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
                </button>
                {openDropdown === cat.id && (
                  <>
                    {/* Mobile backdrop - tap outside to close */}
                    <div 
                      className="fixed inset-0 bg-black/20 z-[60] md:hidden"
                      onClick={() => setOpenDropdown(null)}
                    />
                    {/* Dropdown menu */}
                    <div 
                      className="fixed md:absolute left-4 right-4 md:left-0 md:right-auto top-[140px] md:top-full md:mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl py-2 md:min-w-[200px] z-[70]"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 whitespace-nowrap"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
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
