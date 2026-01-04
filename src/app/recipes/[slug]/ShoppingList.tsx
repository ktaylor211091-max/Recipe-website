"use client";

import { useState } from "react";

type Props = {
  ingredients: string[];
};

export function ShoppingList({ ingredients }: Props) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const toggleItem = (index: number) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedItems(newSet);
  };

  const handleCopyList = () => {
    const list = Array.from(selectedItems)
      .sort((a, b) => a - b)
      .map(i => `• ${ingredients[i]}`)
      .join("\n");
    
    navigator.clipboard.writeText(list);
    alert("Shopping list copied to clipboard!");
  };

  const handlePrint = () => {
    const list = Array.from(selectedItems)
      .sort((a, b) => a - b)
      .map(i => `• ${ingredients[i]}`)
      .join("\n");
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shopping List</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              pre { white-space: pre-wrap; line-height: 1.8; }
            </style>
          </head>
          <body>
            <h1>Shopping List</h1>
            <pre>${list}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleClearAll = () => {
    setSelectedItems(new Set());
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={selectedItems.size === 0}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:bg-neutral-300 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Shopping List ({selectedItems.size})
        </div>
      </button>

      <div className="mt-3 space-y-2">
        {ingredients.map((ingredient, index) => (
          <label 
            key={index} 
            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <input
              type="checkbox"
              checked={selectedItems.has(index)}
              onChange={() => toggleItem(index)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300">{ingredient}</span>
          </label>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Shopping List</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 max-h-96 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
              {Array.from(selectedItems).length > 0 ? (
                <ul className="space-y-2">
                  {Array.from(selectedItems)
                    .sort((a, b) => a - b)
                    .map((index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="text-emerald-600">•</span>
                        <span>{ingredients[index]}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-neutral-500">No items selected</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyList}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Copy
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500"
              >
                Print
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
