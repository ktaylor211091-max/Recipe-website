"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function createCategory(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const name = formData.get("name") as string;
  const displayOrder = parseInt(formData.get("display_order") as string) || 0;
  const parentCategoryId = formData.get("parent_category_id") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Category name is required" };
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const { error } = await supabase.from("categories").insert({
    name: name.trim(),
    slug,
    display_order: displayOrder,
    parent_category_id: parentCategoryId || null,
  });

  if (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const name = formData.get("name") as string;
  const displayOrder = parseInt(formData.get("display_order") as string) || 0;
  const parentCategoryId = formData.get("parent_category_id") as string;

  if (!name || name.trim().length === 0) {
    return { error: "Category name is required" };
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const { error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      slug,
      display_order: displayOrder,
      parent_category_id: parentCategoryId || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  // Check if category has recipes
  const { data: categoryData } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (categoryData?.name) {
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id")
      .eq("category", categoryData.name)
      .limit(1);

    if (recipes && recipes.length > 0) {
      return {
        error:
          "Cannot delete category with existing recipes. Please reassign or delete those recipes first.",
      };
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}
