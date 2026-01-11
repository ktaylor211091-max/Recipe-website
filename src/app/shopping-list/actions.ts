"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ShoppingListItem = {
  id: string;
  user_id: string;
  text: string;
  recipe_title?: string;
  recipe_slug?: string;
  checked: boolean;
  created_at: string;
};

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from("shopping_list")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching shopping list:", error);
    return [];
  }

  return data || [];
}

export async function addShoppingListItem(
  text: string,
  recipeTitle?: string,
  recipeSlug?: string
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  if (!text || text.trim().length === 0) {
    return { error: "Item text is required" };
  }

  const { error } = await supabase.from("shopping_list").insert({
    user_id: userData.user.id,
    text: text.trim(),
    recipe_title: recipeTitle || null,
    recipe_slug: recipeSlug || null,
    checked: false,
  });

  if (error) {
    console.error("Error adding shopping list item:", error);
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function toggleShoppingListItem(id: string, checked: boolean) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list")
    .update({ checked })
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error updating shopping list item:", error);
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function deleteShoppingListItem(id: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting shopping list item:", error);
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function clearCompletedItems() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("checked", true);

  if (error) {
    console.error("Error clearing completed items:", error);
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function clearShoppingList() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error clearing shopping list:", error);
    return { error: error.message };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}
