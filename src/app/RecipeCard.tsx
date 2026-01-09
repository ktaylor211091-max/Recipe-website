import Link from "next/link";
import Image from "next/image";
import { SUPABASE_CONFIG } from "@/lib/supabase/config";

type RecipeCardProps = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  ratings?: number[];
};

export function RecipeCard({
  title,
  slug,
  category,
  description,
  image_path,
  prep_time_minutes,
  cook_time_minutes,
  servings,
  ratings = [],
}: RecipeCardProps) {
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
  const totalTime = (prep_time_minutes || 0) + (cook_time_minutes || 0);

  return (
    <Link href={`/recipes/${slug}`}>
      <div className="group rounded-lg border border-neutral-200 overflow-hidden bg-white hover:shadow-lg transition-all duration-300 hover:border-emerald-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-neutral-100 group-hover:bg-neutral-200 transition-colors">
          {image_path ? (
            <Image
              src={`${SUPABASE_CONFIG.url}/storage/v1/object/public/recipe-images/${image_path}`}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              🍳
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-medium text-white">
              {category}
            </span>
          </div>

          {/* Rating Badge */}
          {avgRating && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5">
              <span className="text-sm font-bold text-neutral-900">{avgRating}</span>
              <span className="text-yellow-400">★</span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title */}
          <h3 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-neutral-100 my-2" />

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-xs text-neutral-600 mt-auto">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">⏱️</span>
                <span>{totalTime} min</span>
              </div>
            )}
            {prep_time_minutes && (
              <div className="flex items-center gap-1">
                <span className="text-sm">👨‍🍳</span>
                <span>{prep_time_minutes} prep</span>
              </div>
            )}
            {servings && (
              <div className="flex items-center gap-1">
                <span className="text-sm">🍽️</span>
                <span>{servings} servings</span>
              </div>
            )}
            {ratings.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">📊</span>
                <span>{ratings.length} ratings</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
