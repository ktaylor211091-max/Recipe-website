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
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600 shadow-sm">
          {searchQuery || selectedCategory !== "all"
            ? "No recipes match your search."
            : "No published recipes yet."}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  {cat}
                </div>
                <div className="text-xs text-neutral-500">
                  {byCategory[cat].length} recipe
                  {byCategory[cat].length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {byCategory[cat].map((r) => {
                  const totalTime =
                    (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0);
                  const imageUrl = getImageUrl(r.image_path);

                  return (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      {imageUrl ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                          <img
                            src={imageUrl}
                            alt={r.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-indigo-50 to-sky-50" />
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-base font-semibold text-neutral-900 line-clamp-1">
                            {r.title}
                          </div>
                          <div className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            {(r.category ?? "General").trim() || "General"}
                          </div>
                        </div>

                        {r.description ? (
                          <div className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-600">
                            {r.description}
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          {totalTime > 0 ? (
                            <div className="flex items-center gap-1">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {totalTime} min
                            </div>
                          ) : null}
                          {r.servings ? (
                            <div className="flex items-center gap-1">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              {r.servings} serving{r.servings === 1 ? "" : "s"}
                            </div>
                          ) : null}
                        </div>
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
