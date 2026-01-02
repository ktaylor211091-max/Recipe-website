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
    <div className="mb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value, selectedCategory);
            }}
            className="w-full border-b-2 border-neutral-300 bg-transparent py-3 text-base font-medium transition-colors focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onSearch(query, e.target.value);
          }}
          className="border-b-2 border-neutral-300 bg-transparent py-3 text-base font-medium transition-colors focus:border-neutral-900 focus:outline-none sm:w-48"
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
