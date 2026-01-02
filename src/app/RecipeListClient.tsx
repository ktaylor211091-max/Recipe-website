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
        <div className="mt-6 rounded-3xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-neutral-700">
            {searchQuery || selectedCategory !== "all"
              ? "No recipes match your search"
              : "No published recipes yet"}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {searchQuery && "Try adjusting your search terms"}
          </p>
        </div>
      ) : (
        <div className="space-y-12 stagger-children">
          {categories.map((cat) => (
            <div key={cat} className="group/category">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 shadow-md">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">{cat}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent"></div>
                <span className="text-sm font-medium text-neutral-400">
                  {byCategory[cat].length} {byCategory[cat].length === 1 ? "recipe" : "recipes"}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {byCategory[cat].map((r, idx) => {
                  const totalTime =
                    (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0);
                  const imageUrl = getImageUrl(r.image_path);

                  return (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-scale-in"
                      style={{animationDelay: `${idx * 0.1}s`}}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-sky-100">
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={r.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="h-16 w-16 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 shadow-lg">
                          <span className="text-xs font-bold text-indigo-600">
                            {(r.category ?? "General").trim() || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 mb-2 transition-colors group-hover:text-indigo-600">
                          {r.title}
                        </h3>

                        {r.description ? (
                          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600 mb-4">
                            {r.description}
                          </p>
                        ) : null}

                        {(totalTime > 0 || r.servings) && (
                          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
                            {totalTime > 0 ? (
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <svg
                                  className="h-4 w-4 text-indigo-500"
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
                                <span className="font-medium">{totalTime} min</span>
                              </div>
                            ) : null}
                            {r.servings ? (
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <svg
                                  className="h-4 w-4 text-sky-500"
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
                                <span className="font-medium">{r.servings} {r.servings === 1 ? "serving" : "servings"}</span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
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
