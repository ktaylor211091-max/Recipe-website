import Link from "next/link";
import type { Category } from "@/app/admin/categories/actions";

type CategoryDiscoveryProps = {
  categories: Category[];
};

const categoryEmojis: Record<string, string> = {
  appetizers: "🥘",
  breakfast: "🥐",
  lunch: "🥗",
  dinner: "🍝",
  desserts: "🍰",
  beverages: "☕",
  salads: "🥗",
  soups: "🍲",
  pasta: "🍝",
  meat: "🥩",
  vegetarian: "🥦",
  vegan: "🌱",
  seafood: "🦞",
  baking: "🧁",
  snacks: "🍪",
  sides: "🥔",
};

export function CategoryDiscovery({ categories }: CategoryDiscoveryProps) {
  const parentCategories = categories
    .filter((cat) => !cat.parent_category_id)
    .slice(0, 8);

  if (parentCategories.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-neutral-900 mb-3">
          Browse Categories
        </h2>
        <p className="text-lg text-neutral-600">
          Explore delicious recipes by category
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {parentCategories.map((category) => {
          const emoji = categoryEmojis[category.slug] || "🍳";

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group rounded-lg border border-neutral-200 p-6 text-center hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white hover:bg-emerald-50"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {emoji}
              </div>
              <h3 className="font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Explore recipes
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
