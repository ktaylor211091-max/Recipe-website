"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components";

type ForkButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export function ForkButton({ recipeId, recipeTitle }: ForkButtonProps) {
  const [isForking, setIsForking] = useState(false);
  const router = useRouter();

  const handleFork = async () => {
    setIsForking(true);
    router.push(`/create-recipe?fork=${recipeId}`);
  };

  return (
    <Button
      onClick={handleFork}
      disabled={isForking}
      isLoading={isForking}
      variant="purple"
      size="md"
      title={`Create your own variation of "${recipeTitle}"`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      Fork Recipe
    </Button>
  );
}
