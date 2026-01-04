import Link from "next/link";
import { getCategories } from "./actions";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Manage Categories
          </h1>
          <p className="mt-2 text-neutral-600">
            Organize your recipes with categories
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
