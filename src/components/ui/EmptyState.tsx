import Link from "next/link";
import { Button } from "@/components";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  illustration?: "recipe" | "search" | "message" | "notification" | "favorite" | "category";
};

const illustrations = {
  recipe: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-emerald-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute inset-4 bg-emerald-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: "150ms" }}></div>
      <div className="absolute inset-8 bg-emerald-300 rounded-full flex items-center justify-center text-5xl">
        🍳
      </div>
    </div>
  ),
  search: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-neutral-100 rounded-full opacity-50"></div>
      <div className="absolute inset-4 bg-neutral-200 rounded-full opacity-60"></div>
      <div className="absolute inset-8 bg-neutral-300 rounded-full flex items-center justify-center text-5xl">
        🔍
      </div>
    </div>
  ),
  message: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute inset-4 bg-blue-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: "150ms" }}></div>
      <div className="absolute inset-8 bg-blue-300 rounded-full flex items-center justify-center text-5xl">
        💬
      </div>
    </div>
  ),
  notification: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-amber-100 rounded-full opacity-50"></div>
      <div className="absolute inset-4 bg-amber-200 rounded-full opacity-60"></div>
      <div className="absolute inset-8 bg-amber-300 rounded-full flex items-center justify-center text-5xl">
        🔔
      </div>
    </div>
  ),
  favorite: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-rose-100 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute inset-4 bg-rose-200 rounded-full opacity-60 animate-pulse" style={{ animationDelay: "150ms" }}></div>
      <div className="absolute inset-8 bg-rose-300 rounded-full flex items-center justify-center text-5xl">
        ❤️
      </div>
    </div>
  ),
  category: (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-purple-100 rounded-full opacity-50"></div>
      <div className="absolute inset-4 bg-purple-200 rounded-full opacity-60"></div>
      <div className="absolute inset-8 bg-purple-300 rounded-full flex items-center justify-center text-5xl">
        📚
      </div>
    </div>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration */}
      {illustration ? (
        illustrations[illustration]
      ) : icon ? (
        <div className="text-6xl mb-6">{icon}</div>
      ) : null}

      {/* Content */}
      <h3 className="text-2xl font-bold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 max-w-md mb-6 leading-relaxed">{description}</p>

      {/* Action Button */}
      {actionLabel && actionHref && (
        <Button variant="primary" size="md" asChild>
          <Link href={actionHref} className="flex items-center gap-2">
            <span>{actionLabel}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Button>
      )}
    </div>
  );
}
