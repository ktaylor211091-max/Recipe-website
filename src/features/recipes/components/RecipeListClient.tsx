"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { RecipeSearch } from "./RecipeSearch";
import { EmptyState } from "@/components";
import type { Category } from "@/app/admin/categories/actions";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author_id: string;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  recipe_reviews?: {
    rating: number;
  }[];
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
  const [sortBy, setSortBy] = useState("newest");

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  const filteredAndSortedRecipes = useMemo(() => {
    const filtered = recipes.filter((r) => {
      const matchesCategory =
        selectedCategoryId === "all" || r.category === selectedCategoryId;
      const matchesQuery =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });

    // Sort filtered recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "prepTime":
          return (a.prep_time_minutes || 999) - (b.prep_time_minutes || 999);
        case "cookTime":
          return (a.cook_time_minutes || 999) - (b.cook_time_minutes || 999);
        default:
          return 0;
      }
    });

    return filtered;
  }, [recipes, searchQuery, selectedCategoryId, sortBy]);

  const byCategory = useMemo(() => {
    const grouped: Record<string, Recipe[]> = {};
    
    // Group filtered recipes by category (using category name as key)
    filteredAndSortedRecipes.forEach((r) => {
      const categoryName = r.category || "General";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(r);
    });
    
    return grouped;
  }, [filteredAndSortedRecipes]);

  // Get categories that have recipes, in display order
  const categoriesWithRecipes = useMemo(() => {
    const categoriesInRecipes = new Set(
      filteredAndSortedRecipes.map((r) => r.category || "General")
    );
    
    // Filter categories table to only those that have recipes
    // and sort by display_order
    return categories
      .filter((cat) => categoriesInRecipes.has(cat.name))
      .sort((a, b) => a.display_order - b.display_order);
  }, [categories, filteredAndSortedRecipes]);

  const handleSearch = (query: string, categoryName: string, sortOption: string) => {
    setSearchQuery(query);
    setSortBy(sortOption);
    
    if (categoryName === "all") {
      setSelectedCategoryId("all");
    } else {
      // Since we're using category name directly, set it as the selected category
      setSelectedCategoryId(categoryName);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath || !supabaseUrl) return null;
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`;
  };

  const getAverageRating = (reviews?: { rating: number }[] | null) => {
    if (!reviews || reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  const renderStars = (rating: number | null, reviewCount: number = 0) => {
    if (rating === null) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              {i < fullStars ? (
                <svg className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ) : i === fullStars && hasHalfStar ? (
                <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
                  <defs>
                    <linearGradient id="half">
                      <stop offset="50%" stopColor="#facc15" />
                      <stop offset="50%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-300 fill-gray-300" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              )}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium text-neutral-600">{rating.toFixed(1)}</span>
        {reviewCount > 0 && (
          <span className="text-xs text-neutral-500">({reviewCount})</span>
        )}
      </div>
    );
  };

  return (
    <>
      <RecipeSearch categories={categoryNames} onSearch={handleSearch} />

      {filteredAndSortedRecipes.length === 0 ? (
        <EmptyState
          illustration="search"
          title={searchQuery || selectedCategoryId !== "all" ? "No recipes found" : "No published recipes yet"}
          description={
            searchQuery || selectedCategoryId !== "all"
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "Recipes will appear here once they are published."
          }
          actionLabel={searchQuery || selectedCategoryId !== "all" ? undefined : "Create Recipe"}
          actionHref={searchQuery || selectedCategoryId !== "all" ? undefined : "/create-recipe"}
        />
      ) : (
        <div className="space-y-16">
          {categoriesWithRecipes.map((cat) => (
            <div key={cat.id} id={cat.slug}>
              <div className="mb-6 border-b border-neutral-200 pb-3">
                <h3 className="text-2xl font-bold text-neutral-900">
                  {cat.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {byCategory[cat.name]?.length || 0} {(byCategory[cat.name]?.length || 0) === 1 ? "recipe" : "recipes"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(byCategory[cat.name] || []).map((r) => {
                  const totalTime =
                    (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0);
                  const imageUrl = getImageUrl(r.image_path);
                  const avgRating = getAverageRating(r.recipe_reviews);

                  return (
                    <Link
                      key={r.id}
                      href={`/recipes/${r.slug}`}
                      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden bg-neutral-100 aspect-[4/3]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={r.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                            <div className="text-6xl">🍳</div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="p-4">
                        <h4 className="text-lg font-bold text-neutral-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {r.title}
                        </h4>

                        {avgRating !== null && (
                          <div className="mb-2">
                            {renderStars(avgRating, r.recipe_reviews?.length || 0)}
                          </div>
                        )}

                        {r.description && (
                          <p className="text-sm text-neutral-600 mb-3 line-clamp-2 leading-relaxed">
                            {r.description}
                          </p>
                        )}

                        {(totalTime > 0 || r.servings) && (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                            {totalTime > 0 && (
                              <span className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{totalTime} min</span>
                              </span>
                            )}
                            {r.servings && (
                              <span className="flex items-center gap-1.5">
                                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-medium">Serves {r.servings}</span>
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
