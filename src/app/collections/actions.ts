"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  recipe_count?: number;
};

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from("recipe_collections")
    .select("*, collection_items(count)")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collections:", error);
    return [];
  }

  return (
    data?.map((col) => ({
      ...col,
      recipe_count: col.collection_items?.[0]?.count || 0,
    })) || []
  );
}

export async function createCollection(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase client not configured");
    return;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    console.error("Not authenticated");
    return;
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("is_public") === "true";

  if (!name || name.trim().length === 0) {
    console.error("Collection name is required");
    return;
  }

  const { error } = await supabase.from("recipe_collections").insert({
    user_id: userData.user.id,
    name: name.trim(),
    description: description?.trim() || null,
    is_public: isPublic,
  });

  if (error) {
    console.error("Error creating collection:", error);
    return;
  }

  revalidatePath("/collections");
}

export async function addRecipeToCollection(recipeId: string, collectionId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from("recipe_collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", userData.user.id)
    .single();

  if (!collection) {
    return { error: "Collection not found" };
  }

  const { error } = await supabase.from("collection_items").insert({
    collection_id: collectionId,
    recipe_id: recipeId,
  });

  if (error) {
    console.error("Error adding recipe to collection:", error);
    return { error: error.message };
  }

  revalidatePath("/collections");
  return { success: true };
}

export async function removeRecipeFromCollection(recipeId: string, collectionId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase client not configured" };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("collection_id", collectionId);

  if (error) {
    console.error("Error removing recipe from collection:", error);
    return { error: error.message };
  }

  revalidatePath("/collections");
  return { success: true };
}

export async function deleteCollection(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase client not configured");
    return;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    console.error("Not authenticated");
    return;
  }

  const id = formData.get("id") as string;
  if (!id) {
    console.error("Collection id is required");
    return;
  }

  const { error } = await supabase
    .from("recipe_collections")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error deleting collection:", error);
    return;
  }

  revalidatePath("/collections");
}
