import { Metadata } from "next";

export function generateRecipeMetadata(recipe: {
  title: string;
  description: string | null;
  image_path: string | null;
  slug: string;
  author_name?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://recipes.local";
  const imageUrl = recipe.image_path
    ? `https://your-supabase-url/storage/v1/object/public/recipe-images/${recipe.image_path}`
    : `${baseUrl}/og-image.png`;

  return {
    title: `${recipe.title} | Recipe Website`,
    description:
      recipe.description ||
      `Try ${recipe.title} recipe - created by ${recipe.author_name || "a great chef"}`,
    openGraph: {
      title: recipe.title,
      description:
        recipe.description ||
        `A delicious recipe for ${recipe.title}`,
      type: "article",
      url: `${baseUrl}/recipes/${recipe.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description:
        recipe.description ||
        `A delicious recipe for ${recipe.title}`,
      images: [imageUrl],
    },
  };
}

export function generateCategoryMetadata(category: {
  name: string;
  slug: string;
  description?: string;
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://recipes.local";

  return {
    title: `${category.name} Recipes | Recipe Website`,
    description:
      category.description ||
      `Explore our collection of ${category.name.toLowerCase()} recipes`,
    openGraph: {
      title: `${category.name} Recipes`,
      description:
        category.description ||
        `Explore our collection of ${category.name.toLowerCase()} recipes`,
      type: "website",
      url: `${baseUrl}/category/${category.slug}`,
    },
  };
}
