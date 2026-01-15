/**
 * JSON-LD Structured Data for SEO
 * Generates schema.org markup for rich snippets in search results
 */

type RecipeStructuredDataProps = {
  name: string;
  description: string | null;
  image: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  ingredients: string[];
  instructions: string[];
  author: {
    name: string;
    url?: string;
  };
  category?: string;
  calories?: number | null;
  rating?: {
    value: number;
    count: number;
  };
  datePublished?: string;
};

export function RecipeStructuredData({
  name,
  description,
  image,
  prepTime,
  cookTime,
  servings,
  ingredients,
  instructions,
  author,
  category,
  calories,
  rating,
  datePublished,
}: RecipeStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://recipe-website.vercel.app";
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description: description || `Delicious ${name} recipe`,
    image: image ? `${image}` : `${baseUrl}/og-image.png`,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
    },
    datePublished: datePublished || new Date().toISOString(),
    ...(prepTime && { prepTime: `PT${prepTime}M` }),
    ...(cookTime && { cookTime: `PT${cookTime}M` }),
    ...(prepTime && cookTime && { totalTime: `PT${prepTime + cookTime}M` }),
    ...(servings && { recipeYield: `${servings} servings` }),
    recipeIngredient: ingredients,
    recipeInstructions: instructions.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
    ...(category && { recipeCategory: category }),
    ...(calories && {
      nutrition: {
        "@type": "NutritionInformation",
        calories: `${calories} calories`,
      },
    }),
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.value,
        ratingCount: rating.count,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

type BreadcrumbStructuredDataProps = {
  items: Array<{
    name: string;
    url: string;
  }>;
};

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

type PersonStructuredDataProps = {
  name: string;
  url: string;
  description?: string;
  image?: string;
};

export function PersonStructuredData({ name, url, description, image }: PersonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(description && { description }),
    ...(image && { image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
