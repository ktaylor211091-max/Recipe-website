"use client";

import { useEffect } from "react";
import { Button } from "@/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg border border-neutral-200 p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-neutral-600 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => reset()}
            className="flex-1"
          >
            Try again
          </Button>
          <Button
            variant="default"
            size="md"
            onClick={() => (window.location.href = "/")}
            className="flex-1"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
