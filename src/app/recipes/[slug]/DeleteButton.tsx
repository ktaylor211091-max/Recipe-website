"use client";

import { useTransition } from "react";
import { deleteRecipe } from "./actions";

type Props = {
  recipeSlug: string;
  recipeTitle: string;
};

export function DeleteButton({ recipeSlug, recipeTitle }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      startTransition(async () => {
        await deleteRecipe(recipeSlug);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-50 hover:border-red-300 hover:shadow-md disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
