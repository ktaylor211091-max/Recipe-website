"use client";

import { useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "./actions";

type CategoriesClientProps = {
  initialCategories: Category[];
};

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setIsAdding(false);
      window.location.reload();
    }
  };

  const handleUpdate = async (
    id: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateCategory(id, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setEditingId(null);
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setError(null);
    const result = await deleteCategory(id);

    if (result.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Add New Category Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + Add Category
        </button>
      )}

      {/* Add New Category Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-neutral-900">
            New Category
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Name
              </label>
              <input
                type="text"
                id="new-category-name"
                name="name"
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                placeholder="e.g., Appetizers"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Display Order
              </label>
              <input
                type="number"
                id="new-category-order"
                name="display_order"
                defaultValue={categories.length}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError(null);
                }}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            {editingId === cat.id ? (
              <form onSubmit={(e) => handleUpdate(cat.id, e)}>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id={`cat-name-${cat.id}`}
                      name="name"
                      defaultValue={cat.name}
                      required
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Display Order
                    </label>
                    <input
                      type="number"
                      id={`cat-order-${cat.id}`}
                      name="display_order"
                      defaultValue={cat.display_order}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setError(null);
                      }}
                      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-neutral-900">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Slug: {cat.slug} · Order: {cat.display_order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="rounded-lg border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && !isAdding && (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-neutral-600">No categories yet. Add one to get started.</p>
        </div>
      )}
    </div>
  );
}
