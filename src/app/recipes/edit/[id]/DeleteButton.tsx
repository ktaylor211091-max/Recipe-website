"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  recipeId: string;
  recipeTitle: string;
};

export function DeleteButton({ recipeId, recipeTitle }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      startTransition(async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from("recipes")
          .delete()
          .eq("id", recipeId);
        
        router.push("/account");
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete Recipe"}
    </button>
  );
}
