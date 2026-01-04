"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { RecipeSearch } from "./RecipeSearch";
import type { Category } from "./admin/categories/actions";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  categories?: {
    name: string;
    slug: string;
  };
};

type RecipeListClientProps = {
  recipes: Recipe[];
  categories: Category[];
  supabaseUrl?: string;
  bucketName: string;
};

export function RecipeListClient({
  recipes,
  categories,
  supabaseUrl,
  bucketName,
}: RecipeListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchesCategory =
        selectedCategoryId === "all" || r.category_id === selectedCategoryId;
      const matchesQuery =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [recipes, searchQuery, selectedCategoryId]);

  const byCategory = useMemo(() => {
    const grouped: Record<string, Recipe[]> = {};
    
    // Group filtered recipes by category
    filteredRecipes.forEach((r) => {
      const cat = categories.find((c) => c.id === r.category_id);
      if (cat) {
        if (!grouped[cat.id]) {
          grouped[cat.id] = [];
        }
        grouped[cat.id].push(r);
      }
    });
    
    return grouped;
  }, [filteredRecipes, categories]);

  // Get categories that have recipes, in display order
  const categoriesWithRecipes = useMemo(() => {
    return categories
      .filter((cat) => byCategory[cat.id] && byCategory[cat.id].length > 0)
      .sort((a, b) => a.display_order - b.display_order);
  }, [categories, byCategory]);

  const handleSearch = (query: string, categoryName: string) => {
    setSearchQuery(query);
    
    if (categoryName === "all") {
      setSelectedCategoryId("all");
    } else {
      const cat = categories.find((c) => c.name === categoryName);
      setSelectedCategoryId(cat?.id || "all");
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath || !supabaseUrl) return null;
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
  };

  return (
    <>
      <RecipeSearch categories={categoryNames} onSearch={handleSearch} />

      {filteredRecipes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium text-neutral-700">
            {searchQuery || selectedCategoryId !== "all"
              ? "No recipes match your search"
              : "No published recipes yet"}
          </p>
          {searchQuery && (
            <p className="mt-2 text-sm text-neutral-500">
              Try adjusting your search terms
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {categoriesWithRecipes.map((cat) => (
            <div key={cat.id} id={cat.slug}>
              <div className="mb-6 border-b border-neutral-200 pb-3">
                <h3 className="text-2xl font-bold text-neutral-900">
                  {cat.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {byCategory[cat.id].length} {byCategory[cat.id].length === 1 ? "recipe" : "recipes"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {byCategory[cat.id].map((r) => {
                  const totalTime =
                    (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0);
                  const imageUrl = getImageUrl(r.image_path);

                  return (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="group block bg-white"
                    >
                      <div className="overflow-hidden rounded-lg bg-neutral-100 mb-3 aspect-[4/3]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={r.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-5xl">🍳</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-neutral-900 mb-2 leading-snug group-hover:text-neutral-600 transition-colors">
                          {r.title}
                        </h4>

                        {(totalTime > 0 || r.servings) && (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                            {totalTime > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {totalTime} min
                              </span>
                            )}
                            {r.servings && (
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Serves {r.servings}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
