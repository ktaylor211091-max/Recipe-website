"use client";

import { useState, useMemo } from "react";

type RecipeSearchProps = {
  categories: string[];
  onSearch: (query: string, category: string, sortBy: string, dietary?: string[]) => void;
};

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🥛" },
  { id: "nut-free", label: "Nut-Free", emoji: "🥜" },
  { id: "low-carb", label: "Low-Carb", emoji: "🥩" },
];

export function RecipeSearch({ categories, onSearch }: RecipeSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    // In a real implementation, this would be from your database
    return categories.filter((cat) =>
      cat.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, categories]);

  const handleChange = (newQuery?: string, newCategory?: string, newSort?: string, newDietary?: string[]) => {
    const q = newQuery !== undefined ? newQuery : query;
    const c = newCategory !== undefined ? newCategory : selectedCategory;
    const s = newSort !== undefined ? newSort : sortBy;
    const d = newDietary !== undefined ? newDietary : selectedDietary;
    onSearch(q, c, s, d);
  };

  const toggleDietary = (dietary: string) => {
    const updated = selectedDietary.includes(dietary)
      ? selectedDietary.filter((d) => d !== dietary)
      : [...selectedDietary, dietary];
    setSelectedDietary(updated);
    handleChange(undefined, undefined, undefined, updated);
  };

  return (
    <div className="mb-12">
      <div className="flex flex-col gap-4">
        {/* Search Bar with Suggestions */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-neutral-400"
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
            autoComplete="off"
          />

          {/* Search Suggestions */}
          {suggestions.length > 0 && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-10">
              {suggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleChange(suggestion);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors text-sm"
                >
                  🔍 {suggestion}
                </button>
              ))}
            </div>
          )}
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

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                showAdvanced ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Filters
          </button>
        </div>

        {/* Advanced Filters - Dietary Options */}
        {showAdvanced && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              🥗 Dietary Preferences
            </p>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleDietary(option.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedDietary.includes(option.id)
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white border border-neutral-300 text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <span>{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
