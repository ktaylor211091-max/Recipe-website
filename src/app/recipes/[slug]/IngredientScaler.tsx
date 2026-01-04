"use client";

import { useState } from "react";

type IngredientScalerProps = {
  initialServings: number;
  ingredients: string[];
};

export function IngredientScaler({ initialServings, ingredients }: IngredientScalerProps) {
  const [scale, setScale] = useState(1);

  const scaledServings = Math.round(initialServings * scale);

  const scaleIngredient = (ingredient: string): string => {
    // Match fractions and numbers at the start of the ingredient
    const fractionMatch = ingredient.match(/^(\d+\/\d+|\d+\s+\d+\/\d+|\d+\.?\d*)\s/);
    
    if (fractionMatch) {
      const originalAmount = fractionMatch[1];
      let numericAmount: number;

      // Handle mixed fractions (e.g., "1 1/2")
      if (originalAmount.includes(' ')) {
        const [whole, frac] = originalAmount.split(' ');
        const [num, den] = frac.split('/').map(Number);
        numericAmount = parseInt(whole) + num / den;
      }
      // Handle simple fractions (e.g., "1/2")
      else if (originalAmount.includes('/')) {
        const [num, den] = originalAmount.split('/').map(Number);
        numericAmount = num / den;
      }
      // Handle decimals or whole numbers
      else {
        numericAmount = parseFloat(originalAmount);
      }

      const scaledAmount = numericAmount * scale;
      const rest = ingredient.substring(fractionMatch[0].length);

      // Format the scaled amount nicely
      let formattedAmount: string;
      if (scaledAmount % 1 === 0) {
        formattedAmount = scaledAmount.toString();
      } else {
        formattedAmount = scaledAmount.toFixed(2).replace(/\.?0+$/, '');
      }

      return `${formattedAmount} ${rest}`;
    }

    return ingredient;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-700">Scale recipe:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.5))}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            disabled={scale <= 0.5}
          >
            −
          </button>
          <span className="min-w-[80px] text-center text-sm font-bold">
            {scale}x ({scaledServings} servings)
          </span>
          <button
            onClick={() => setScale(scale + 0.5)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            +
          </button>
          {scale !== 1 && (
            <button
              onClick={() => setScale(1)}
              className="ml-2 text-xs text-neutral-500 underline hover:text-neutral-700"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ing, i) => (
          <li key={i} className="flex items-start gap-2 text-neutral-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>{scaleIngredient(ing)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
