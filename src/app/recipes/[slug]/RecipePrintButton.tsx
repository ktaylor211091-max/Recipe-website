"use client";

type Recipe = {
  title: string;
  description?: string | null;
  category?: string;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  ingredients?: string[];
  steps?: string[];
};

type RecipePrintButtonProps = {
  recipe: Recipe;
};

export function RecipePrintButton({ recipe }: RecipePrintButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.title} - Recipe</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 2cm; }
            }
            body {
              font-family: 'Georgia', serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 0.5rem;
              color: #16a34a;
            }
            .category {
              display: inline-block;
              background: #16a34a;
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.875rem;
              margin-bottom: 1rem;
            }
            .description {
              font-size: 1.125rem;
              color: #666;
              margin-bottom: 1.5rem;
            }
            .meta {
              display: flex;
              gap: 2rem;
              margin: 1.5rem 0;
              padding: 1rem;
              background: #f9fafb;
              border-radius: 0.5rem;
            }
            .meta-item {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .meta-item strong {
              color: #16a34a;
            }
            h2 {
              font-size: 1.5rem;
              margin-top: 2rem;
              margin-bottom: 1rem;
              color: #16a34a;
              border-bottom: 2px solid #16a34a;
              padding-bottom: 0.5rem;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              margin: 0.5rem 0;
              padding-left: 1.5rem;
              position: relative;
            }
            li:before {
              content: "•";
              position: absolute;
              left: 0;
              color: #16a34a;
              font-weight: bold;
              font-size: 1.5rem;
              line-height: 1;
            }
            ol {
              counter-reset: step-counter;
              padding: 0;
            }
            ol li {
              counter-increment: step-counter;
              margin: 1rem 0;
              padding-left: 3rem;
              position: relative;
            }
            ol li:before {
              content: counter(step-counter);
              position: absolute;
              left: 0;
              width: 2rem;
              height: 2rem;
              background: #16a34a;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-center;
              font-weight: bold;
              font-size: 1rem;
            }
            .footer {
              margin-top: 3rem;
              padding-top: 1rem;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          ${recipe.category ? `<div class="category">${recipe.category}</div>` : ""}
          ${recipe.description ? `<p class="description">${recipe.description}</p>` : ""}
          
          <div class="meta">
            ${totalTime > 0 ? `<div class="meta-item"><strong>⏱️ Total Time:</strong> ${totalTime} min</div>` : ""}
            ${recipe.prep_time_minutes ? `<div class="meta-item"><strong>👨‍🍳 Prep:</strong> ${recipe.prep_time_minutes} min</div>` : ""}
            ${recipe.cook_time_minutes ? `<div class="meta-item"><strong>🔥 Cook:</strong> ${recipe.cook_time_minutes} min</div>` : ""}
            ${recipe.servings ? `<div class="meta-item"><strong>🍽️ Servings:</strong> ${recipe.servings}</div>` : ""}
          </div>

          ${
            recipe.ingredients && recipe.ingredients.length > 0
              ? `
            <h2>Ingredients</h2>
            <ul>
              ${recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}
            </ul>
          `
              : ""
          }

          ${
            recipe.steps && recipe.steps.length > 0
              ? `
            <h2>Instructions</h2>
            <ol>
              ${recipe.steps.map((step) => `<li>${step}</li>`).join("")}
            </ol>
          `
              : ""
          }

          <div class="footer">
            <p>Printed from Recipe Website</p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      Print Recipe
    </button>
  );
}
