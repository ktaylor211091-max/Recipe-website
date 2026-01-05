"use client";

import { useState, useTransition } from "react";

type Props = {
  recipeId: string;
  initialIsFavorite: boolean;
};

export function FavoriteButton({ recipeId, initialIsFavorite }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId }),
        });

        if (response.ok) {
          setIsFavorite(!isFavorite);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            // Not logged in - redirect to login
            window.location.href = `/login?error=${encodeURIComponent("Please sign in to save favorites")}`;
          } else {
            alert(data.error || "Failed to update favorite");
          }
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        alert("Failed to update favorite");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavorite
          ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
      }`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isPending ? (
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg
          className={`h-5 w-5 transition-all ${isFavorite ? "fill-red-600 scale-110" : "fill-none group-hover:scale-110"}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      {isFavorite ? "Saved" : "Save"}
    </button>
  );
}
