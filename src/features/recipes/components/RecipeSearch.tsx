"use client";

import { useState, useMemo } from "react";

type RecipeSearchProps = {
  categories: string[];
  onSearch: (
    query: string,
    category: string,
    sortBy: string,
    filters?: {
      dietary?: string[];
      difficulty?: string;
      maxPrepTime?: number;
      maxCalories?: number;
    }
  ) => void;
};

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🥛" },
  { id: "nut-free", label: "Nut-Free", emoji: "🥜" },
  { id: "low-carb", label: "Low-Carb", emoji: "🥩" },
];

const difficultyOptions = [
  { id: "easy", label: "Easy", emoji: "😊" },
  { id: "medium", label: "Medium", emoji: "🤔" },
  { id: "hard", label: "Hard", emoji: "💪" },
];

export function RecipeSearch({ categories, onSearch }: RecipeSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("");
  const [maxPrepTime, setMaxPrepTime] = useState<number>(0);
  const [maxCalories, setMaxCalories] = useState<number>(0);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    // In a real implementation, this would be from your database
    return categories.filter((cat) =>
      cat.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, categories]);

  const handleChange = () => {
    onSearch(query, selectedCategory, sortBy, {
      dietary: selectedDietary,
      difficulty: difficulty || undefined,
      maxPrepTime: maxPrepTime > 0 ? maxPrepTime : undefined,
      maxCalories: maxCalories > 0 ? maxCalories : undefined,
    });
  };

  const toggleDietary = (dietary: string) => {
    const updated = selectedDietary.includes(dietary)
      ? selectedDietary.filter((d) => d !== dietary)
      : [...selectedDietary, dietary];
    setSelectedDietary(updated);
    setTimeout(handleChange, 0);
  };

  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty === difficulty ? "" : newDifficulty);
    setTimeout(handleChange, 0);
  };

  return (
    <div className="mb-16">
      <div className="flex flex-col gap-5">
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
              setTimeout(handleChange, 0);
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
                    setTimeout(handleChange, 0);
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
              setTimeout(handleChange, 0);
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
              setTimeout(handleChange, 0);
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

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
            {/* Dietary Preferences */}
            <div>
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

            {/* Difficulty Level */}
            <div>
              <p className="text-sm font-semibold text-neutral-900 mb-3">
                🎯 Difficulty Level
              </p>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleDifficultyChange(option.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      difficulty === option.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white border border-neutral-300 text-neutral-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <span>{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time and Calorie Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-neutral-900 mb-2 block">
                  ⏱️ Max Prep Time
                </label>
                <select
                  value={maxPrepTime}
                  onChange={(e) => {
                    setMaxPrepTime(parseInt(e.target.value));
                    setTimeout(handleChange, 0);
                  }}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="0">Any</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-900 mb-2 block">
                  🔥 Max Calories
                </label>
                <select
                  value={maxCalories}
                  onChange={(e) => {
                    setMaxCalories(parseInt(e.target.value));
                    setTimeout(handleChange, 0);
                  }}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="0">Any</option>
                  <option value="200">200 cal</option>
                  <option value="400">400 cal</option>
                  <option value="600">600 cal</option>
                  <option value="800">800 cal</option>
                  <option value="1000">1000 cal</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
