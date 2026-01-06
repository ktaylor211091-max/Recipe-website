"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ShoppingListItem = {
  id: string;
  text: string;
  recipeTitle?: string;
  recipeSlug?: string;
  checked: boolean;
};

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("shoppingList");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const saveItems = (newItems: ShoppingListItem[]) => {
    setItems(newItems);
    localStorage.setItem("shoppingList", JSON.stringify(newItems));
  };

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    saveItems(updated);
  };

  const addManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newItemObj: ShoppingListItem = {
      id: Date.now().toString(),
      text: newItem.trim(),
      checked: false,
    };

    saveItems([...items, newItemObj]);
    setNewItem("");
  };

  const clearAll = () => {
    if (confirm("Clear entire shopping list?")) {
      saveItems([]);
    }
  };

  const clearChecked = () => {
    const updated = items.filter((item) => !item.checked);
    saveItems(updated);
  };

  const handlePrint = () => {
    const list = items.map(item => `${item.checked ? '☑' : '☐'} ${item.text}`).join("\n");
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shopping List</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1 { font-size: 28px; margin-bottom: 20px; color: #0f172a; }
              .item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
              .checked { text-decoration: line-through; color: #9ca3af; }
            </style>
          </head>
          <body>
            <h1>🛒 Shopping List</h1>
            ${items.map(item => `
              <div class="item ${item.checked ? 'checked' : ''}">
                ${item.checked ? '☑' : '☐'} ${item.text}
                ${item.recipeTitle ? `<span style="color: #10b981; font-size: 12px;"> (from ${item.recipeTitle})</span>` : ''}
              </div>
            `).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Group items by recipe
  const recipeItems = items.filter((item) => item.recipeTitle);
  const manualItems = items.filter((item) => !item.recipeTitle);
  const groupedByRecipe = recipeItems.reduce((acc, item) => {
    const key = item.recipeTitle || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  return (
    <main className="animate-fade-in">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Shopping List
          </h1>
          <p className="mt-2 text-neutral-600">
            {items.length} item{items.length !== 1 ? "s" : ""} •{" "}
            {items.filter((i) => i.checked).length} checked
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Print
          </button>
          {items.filter((i) => i.checked).length > 0 && (
            <button
              onClick={clearChecked}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Clear Checked
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shopping List Items */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Your shopping list is empty
              </h2>
              <p className="text-neutral-600 mb-6">
                Add ingredients from recipes or create custom items below
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                Browse Recipes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recipe-based items */}
              {Object.entries(groupedByRecipe).map(([recipeTitle, recipeItems]) => (
                <div
                  key={recipeTitle}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-neutral-900">
                      {recipeTitle}
                    </h2>
                    {recipeItems[0]?.recipeSlug && (
                      <Link
                        href={`/recipes/${recipeItems[0].recipeSlug}`}
                        className="text-sm font-medium text-emerald-600 hover:underline"
                      >
                        View Recipe →
                      </Link>
                    )}
                  </div>
                  <div className="space-y-2">
                    {recipeItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            item.checked
                              ? "text-neutral-400 line-through"
                              : "text-neutral-700"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Manual items */}
              {manualItems.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-neutral-900">
                    Custom Items
                  </h2>
                  <div className="space-y-2">
                    {manualItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="h-5 w-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            item.checked
                              ? "text-neutral-400 line-through"
                              : "text-neutral-700"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Item Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Add Custom Item
            </h2>
            <form onSubmit={addManualItem} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., Milk, Eggs, Bread..."
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={!newItem.trim()}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-emerald-50 p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-emerald-800">
                  <p className="font-semibold mb-1">Tip</p>
                  <p>
                    Visit recipe pages and use the shopping list feature to add
                    ingredients directly to your list!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
