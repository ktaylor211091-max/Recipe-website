"use client";

import { useState } from "react";

type RecipeSearchProps = {
  categories: string[];
  onSearch: (query: string, category: string, sortBy: string) => void;
};

export function RecipeSearch({ categories, onSearch }: RecipeSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleChange = (newQuery?: string, newCategory?: string, newSort?: string) => {
    const q = newQuery !== undefined ? newQuery : query;
    const c = newCategory !== undefined ? newCategory : selectedCategory;
    const s = newSort !== undefined ? newSort : sortBy;
    onSearch(q, c, s);
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search recipes by name, ingredients, or description..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleChange(e.target.value, undefined, undefined);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-11 pr-4 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              handleChange(undefined, e.target.value, undefined);
            }}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:w-48"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              handleChange(undefined, undefined, e.target.value);
            }}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:w-48"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">A to Z</option>
            <option value="prepTime">Prep Time</option>
            <option value="cookTime">Cook Time</option>
          </select>
        </div>
      </div>
    </div>
  );
}
