"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components";

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
    <Button
      onClick={handleToggle}
      disabled={isPending}
      isLoading={isPending}
      variant={isFavorite ? "danger" : "outline"}
      size="md"
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      {!isPending && (
        <svg
          className={`h-5 w-5 transition-all ${isFavorite ? "fill-red-600 scale-110" : "fill-none"}`}
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
    </Button>
  );
}
