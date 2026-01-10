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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialCategories.filter(cat => !cat.parent_category_id).map(cat => cat.id))
  );

  // Organize categories into parent-child relationships
  const mainCategories = categories.filter(cat => !cat.parent_category_id);
  const getSubcategories = (parentId: string) =>
    categories.filter(cat => cat.parent_category_id === parentId);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
                Parent Category (Optional)
              </label>
              <select
                id="new-category-parent"
                name="parent_category_id"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
              >
                <option value="">None (Main Category)</option>
                {mainCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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

      {/* Categories List - Hierarchical Display */}
      <div className="space-y-2">
        {mainCategories.map((mainCat) => {
          const subcategories = getSubcategories(mainCat.id);
          const isExpanded = expandedCategories.has(mainCat.id);
          
          return (
            <div key={mainCat.id}>
              {/* Main Category */}
              <div className="rounded-lg border-2 border-neutral-300 bg-white p-4 shadow-sm">
                {editingId === mainCat.id ? (
                  <form onSubmit={(e) => handleUpdate(mainCat.id, e)}>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                          Name
                        </label>
                        <input
                          type="text"
                          id={`cat-name-${mainCat.id}`}
                          name="name"
                          defaultValue={mainCat.name}
                          required
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                          Parent Category (Optional)
                        </label>
                        <select
                          id={`cat-parent-${mainCat.id}`}
                          name="parent_category_id"
                          defaultValue={mainCat.parent_category_id || ""}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                        >
                          <option value="">None (Main Category)</option>
                          {mainCategories.filter(c => c.id !== mainCat.id).map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-700">
                          Display Order
                        </label>
                        <input
                          type="number"
                          id={`cat-order-${mainCat.id}`}
                          name="display_order"
                          defaultValue={mainCat.display_order}
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
                    <div className="flex items-center gap-3">
                      {subcategories.length > 0 && (
                        <button
                          onClick={() => toggleCategory(mainCat.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100"
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      )}
                      {subcategories.length === 0 && <div className="w-6" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-neutral-900">
                            {mainCat.name}
                          </h4>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Main Category
                          </span>
                          {subcategories.length > 0 && (
                            <span className="text-xs text-neutral-500">
                              ({subcategories.length} subcategories)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          Slug: {mainCat.slug} · Order: {mainCat.display_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(mainCat.id)}
                        className="rounded-lg border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(mainCat.id)}
                        className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategories */}
              {isExpanded && subcategories.length > 0 && (
                <div className="ml-8 mt-2 space-y-2 border-l-2 border-neutral-200 pl-4">
                  {subcategories.map((subCat) => (
                    <div
                      key={subCat.id}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                    >
                      {editingId === subCat.id ? (
                        <form onSubmit={(e) => handleUpdate(subCat.id, e)}>
                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Name
                              </label>
                              <input
                                type="text"
                                id={`cat-name-${subCat.id}`}
                                name="name"
                                defaultValue={subCat.name}
                                required
                                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Parent Category
                              </label>
                              <select
                                id={`cat-parent-${subCat.id}`}
                                name="parent_category_id"
                                defaultValue={subCat.parent_category_id || ""}
                                className="w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-neutral-900 focus:outline-none"
                              >
                                <option value="">None (Make Main Category)</option>
                                {mainCategories.map(cat => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-neutral-700">
                                Display Order
                              </label>
                              <input
                                type="number"
                                id={`cat-order-${subCat.id}`}
                                name="display_order"
                                defaultValue={subCat.display_order}
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
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400">└</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-semibold text-neutral-800">
                                  {subCat.name}
                                </h5>
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                  Subcategory
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500">
                                Slug: {subCat.slug} · Order: {subCat.display_order}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(subCat.id)}
                              className="rounded-lg border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subCat.id)}
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
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && !isAdding && (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-neutral-600">No categories yet. Add one to get started.</p>
        </div>
      )}
    </div>
  );
}
