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
      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
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
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value, selectedCategory);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onSearch(query, e.target.value);
          }}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
