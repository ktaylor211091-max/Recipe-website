"use client";

import { useState } from "react";

type Props = {
  initialServings: number;
  ingredients: string[];
};

export function IngredientScalerWithShopping({ initialServings, ingredients }: Props) {
  const [scale, setScale] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [shoppingMode, setShoppingMode] = useState(false);

  const scaleIngredient = (ingredient: string): string => {
    // Match fractional patterns like 1/2, 1 1/2, etc.
    const fractionPattern = /^(\d+)?\s*(\d+)\/(\d+)/;
    const match = ingredient.match(fractionPattern);

    if (match) {
      const whole = match[1] ? parseInt(match[1]) : 0;
      const num = parseInt(match[2]);
      const denom = parseInt(match[3]);
      const originalAmount = whole + num / denom;
      const scaledAmount = originalAmount * scale;

      // Convert back to fraction if possible
      const tolerance = 0.01;
      const commonFractions = [
        [1, 4],
        [1, 3],
        [1, 2],
        [2, 3],
        [3, 4],
      ];

      const wholeNumber = Math.floor(scaledAmount);
      const fraction = scaledAmount - wholeNumber;

      let fractionString = "";
      for (const [n, d] of commonFractions) {
        if (Math.abs(fraction - n / d) < tolerance) {
          fractionString = `${n}/${d}`;
          break;
        }
      }

      let result;
      if (wholeNumber > 0 && fractionString) {
        result = `${wholeNumber} ${fractionString}`;
      } else if (wholeNumber > 0) {
        result = `${wholeNumber}`;
      } else if (fractionString) {
        result = fractionString;
      } else if (scaledAmount > 0) {
        result = scaledAmount.toFixed(1).replace(/\.0$/, "");
      } else {
        result = "0";
      }

      return ingredient.replace(fractionPattern, result);
    }

    // Try decimal or whole number at the start
    const numberPattern = /^(\d+\.?\d*)/;
    const numMatch = ingredient.match(numberPattern);
    if (numMatch) {
      const originalAmount = parseFloat(numMatch[1]);
      const scaledAmount = originalAmount * scale;
      const formattedAmount = scaledAmount.toFixed(1).replace(/\.0$/, "");
      return ingredient.replace(numberPattern, formattedAmount);
    }

    return ingredient;
  };

  const scaledIngredients = ingredients.map((ing) => scaleIngredient(ing));
  const scaledServings = Math.round(initialServings * scale);

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
      .map((i) => `• ${scaledIngredients[i]}`)
      .join("\n");

    navigator.clipboard.writeText(list);
    alert("Shopping list copied to clipboard!");
  };

  const handlePrint = () => {
    const list = Array.from(selectedItems)
      .sort((a, b) => a - b)
      .map((i) => `• ${scaledIngredients[i]}`)
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
    setShoppingMode(false);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Servings: <span className="font-semibold text-neutral-900">{scaledServings}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.5))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold text-neutral-900">
            {scale}x
          </span>
          <button
            onClick={() => setScale(scale + 0.5)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            +
          </button>
          {scale !== 1 && (
            <button
              onClick={() => setScale(1)}
              className="ml-2 rounded-lg border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {scaledIngredients.map((ingredient, index) => (
          shoppingMode ? (
            <label
              key={index}
              className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedItems.has(index)}
                onChange={() => toggleItem(index)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex-1 text-sm text-neutral-700">{ingredient}</span>
            </label>
          ) : (
            <div key={index} className="flex items-start gap-3">
              <span className="text-emerald-600 mt-0.5">•</span>
              <span className="flex-1 text-sm text-neutral-700">{ingredient}</span>
            </div>
          )
        ))}
      </div>

      <button
        onClick={() => {
          if (shoppingMode) {
            setShowModal(true);
          } else {
            setShoppingMode(true);
          }
        }}
        disabled={shoppingMode && selectedItems.size === 0}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:bg-neutral-300 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {shoppingMode ? `Shopping List (${selectedItems.size})` : 'Create Shopping List'}
        </div>
      </button>

      {shoppingMode && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setShoppingMode(false)}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Shopping List</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 max-h-96 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {Array.from(selectedItems).length > 0 ? (
                <ul className="space-y-2">
                  {Array.from(selectedItems)
                    .sort((a, b) => a - b)
                    .map((index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-neutral-700"
                      >
                        <span className="text-emerald-600">•</span>
                        <span>{scaledIngredients[index]}</span>
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
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
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
