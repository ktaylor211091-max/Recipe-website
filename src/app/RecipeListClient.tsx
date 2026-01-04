"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { RecipeSearch } from "./RecipeSearch";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
};

type RecipeListClientProps = {
  recipes: Recipe[];
  supabaseUrl?: string;
  bucketName: string;
};

export function RecipeListClient({
  recipes,
  supabaseUrl,
  bucketName,
}: RecipeListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allCategories = useMemo(() => {
    const cats = new Set(
      recipes.map((r) => (r.category ?? "General").trim() || "General")
    );
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const cat = (r.category ?? "General").trim() || "General";
      const matchesCategory =
        selectedCategory === "all" || cat === selectedCategory;
      const matchesQuery =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const byCategory = useMemo(() => {
    return filteredRecipes.reduce<Record<string, Recipe[]>>((acc, r) => {
      const cat = (r.category ?? "General").trim() || "General";
      (acc[cat] ??= []).push(r);
      return acc;
    }, {});
  }, [filteredRecipes]);

  const categories = useMemo(
    () => Object.keys(byCategory).sort((a, b) => a.localeCompare(b)),
    [byCategory]
  );

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setSelectedCategory(category);
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath || !supabaseUrl) return null;
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
  };

  return (
    <>
      <RecipeSearch categories={allCategories} onSearch={handleSearch} />

      {filteredRecipes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium text-neutral-700">
            {searchQuery || selectedCategory !== "all"
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
          {categories.map((cat) => (
            <div key={cat} id={cat.toLowerCase().replace(/\s+/g, '-')}>
              <div className="mb-6 border-b border-neutral-200 pb-3">
                <h3 className="text-2xl font-bold text-neutral-900">
                  {cat}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {byCategory[cat].length} {byCategory[cat].length === 1 ? "recipe" : "recipes"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {byCategory[cat].map((r) => {
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
