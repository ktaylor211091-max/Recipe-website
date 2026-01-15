import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://recipe-website.vercel.app";
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/create-recipe`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ];

  // Fetch dynamic recipe pages
  const supabase = await createSupabaseServerClient();
  let recipeRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  if (supabase) {
    // Get all published recipes
    const { data: recipes } = await supabase
      .from("recipes")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (recipes) {
      recipeRoutes = recipes.map((recipe: { slug: string; updated_at: string }) => ({
        url: `${baseUrl}/recipes/${recipe.slug}`,
        lastModified: new Date(recipe.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }

    // Get all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .order("name");

    if (categories) {
      categoryRoutes = categories.map((category: { slug: string }) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));
    }
  }

  return [...staticRoutes, ...categoryRoutes, ...recipeRoutes];
}
