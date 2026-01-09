export function RecipeCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white animate-pulse">
      <div className="aspect-video bg-neutral-300" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-neutral-200 rounded-full w-16" />
          <div className="h-6 bg-neutral-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export function RecipeListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RecipeDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-96 bg-neutral-300 rounded-lg" />
      <div className="space-y-4">
        <div className="h-12 bg-neutral-200 rounded w-3/4" />
        <div className="h-6 bg-neutral-200 rounded w-1/2" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white animate-pulse">
      <div className="aspect-square bg-neutral-300" />
      <div className="p-4 space-y-2">
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
      </div>
    </div>
  );
}
