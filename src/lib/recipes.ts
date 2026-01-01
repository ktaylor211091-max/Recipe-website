export type RecipeListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Recipe = RecipeListItem & {
  ingredients: string[];
  steps: string[];
  image_path: string | null;
  published: boolean;
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
