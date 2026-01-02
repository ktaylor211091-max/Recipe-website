"use client";

import { useState } from "react";

type RecipeSearchProps = {
  categories: string[];
  onSearch: (query: string, category: string) => void;
};

export function RecipeSearch({ categories, onSearch }: RecipeSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = () => {
    onSearch(query, selectedCategory);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for recipes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value, selectedCategory);
            }}
            className="w-full rounded-xl border-2 border-neutral-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm transition-all focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:shadow-md"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onSearch(query, e.target.value);
          }}
          className="rounded-xl border-2 border-neutral-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition-all focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:shadow-md sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
