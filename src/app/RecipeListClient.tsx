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
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
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
        <div className="space-y-20">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="mb-8 text-center">
                <h3 className="text-4xl font-bold tracking-tighter text-pink-600 mb-2">
                  {cat.toUpperCase()}
                </h3>
                <p className="text-sm text-neutral-600">
                  {byCategory[cat].length} {byCategory[cat].length === 1 ? "recipe" : "recipes"}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {byCategory[cat].map((r) => {
                  const totalTime =
                    (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0);
                  const imageUrl = getImageUrl(r.image_path);

                  return (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="group block"
                    >
                      <div className="overflow-hidden bg-pink-100/50 mb-4 aspect-[4/3] rounded-lg border-2 border-transparent group-hover:border-purple-400 transition-colors duration-300">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={r.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-6xl">🍳</div>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl font-bold tracking-tight text-neutral-900 mb-2 group-hover:underline">
                          {r.title}
                        </h4>

                        {r.description && (
                          <p className="line-clamp-2 text-sm text-neutral-600 mb-3 leading-relaxed">
                            {r.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-600">
                          {totalTime > 0 && (
                            <span>{totalTime} MIN</span>
                          )}
                          {r.servings && (
                            <span>· {r.servings} SERVINGS</span>
                          )}
                          <span className="ml-auto text-pink-500 transition-all group-hover:translate-x-1 group-hover:text-purple-600">→</span>
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
