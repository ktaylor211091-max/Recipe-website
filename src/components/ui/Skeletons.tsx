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

export function CommentSkeleton() {
  return (
    <div className="animate-pulse flex gap-3">
      <div className="h-10 w-10 rounded-full bg-neutral-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-32" />
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-4 bg-neutral-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-neutral-200" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-neutral-200 rounded w-48" />
          <div className="h-4 bg-neutral-200 rounded w-32" />
        </div>
      </div>
      <div className="flex gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-8 bg-neutral-200 rounded w-16" />
            <div className="h-4 bg-neutral-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-4 rounded-lg border border-neutral-200">
          <div className="h-12 w-12 rounded bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 p-4 rounded-lg border border-neutral-200">
      <div className="h-10 w-10 rounded-full bg-neutral-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-full" />
        <div className="h-3 bg-neutral-200 rounded w-32" />
      </div>
    </div>
  );
}
