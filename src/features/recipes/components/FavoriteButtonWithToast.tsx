"use client";

import { useToast } from "@/components";
import { useState } from "react";

type FavoriteButtonWithToastProps = {
  recipeId: string;
  recipeName: string;
  initialIsFavorited: boolean;
};

export function FavoriteButtonWithToast({
  recipeId,
  recipeName,
  initialIsFavorited,
}: FavoriteButtonWithToastProps) {
  const { showToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: isFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        showToast(
          isFavorited
            ? `Removed ${recipeName} from favorites`
            : `Added ${recipeName} to favorites`,
          "success"
        );
      } else {
        throw new Error("Failed to update favorite");
      }
    } catch (error) {
      showToast("Failed to update favorite. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
        isFavorited
          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          : "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
      }`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{isFavorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
