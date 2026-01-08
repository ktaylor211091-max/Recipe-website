"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { slugify } from "@/lib/recipes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function splitLines(input: string) {
  return input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createUserRecipe(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const ingredientsText = String(formData.get("ingredients") ?? "");
  const stepsText = String(formData.get("steps") ?? "");
  const prepTime = formData.get("prep_time_minutes");
  const cookTime = formData.get("cook_time_minutes");
  const servings = formData.get("servings");
  const notes = String(formData.get("notes") ?? "").trim();
  const tips = String(formData.get("tips") ?? "").trim();
  const calories = formData.get("calories");
  const proteinGrams = formData.get("protein_grams");
  const carbsGrams = formData.get("carbs_grams");
  const fatGrams = formData.get("fat_grams");
  const fiberGrams = formData.get("fiber_grams");
  const published = formData.get("published") === "on";
  const tagIds = formData.getAll("tags").map((id) => String(id));
  const imageFile = formData.get("image");
  const forkRecipeId = String(formData.get("fork_recipe_id") ?? "").trim();

  if (!title || !category) {
    redirect(`/create-recipe?error=${encodeURIComponent("Title and category are required")}`);
  }

  const slug = slugify(title);
  if (!slug) {
    redirect(`/create-recipe?error=${encodeURIComponent("Could not create a slug from title")}`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(`/create-recipe?error=${encodeURIComponent("Service not configured")}`);
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect(`/login?error=${encodeURIComponent("Please sign in to create recipes")}`);
  }

  const ingredients = splitLines(ingredientsText);
  const steps = splitLines(stepsText);

  // Get the category ID for the selected category name
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  if (!categoryData) {
    redirect(`/create-recipe?error=${encodeURIComponent("Selected category not found")}`);
  }

  const categoryId = categoryData.id;

  let image_path: string | null = null;

  // Upload image if provided
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > MAX_FILE_SIZE) {
      redirect(`/create-recipe?error=${encodeURIComponent("Image too large. Maximum size is 5MB. Please compress your image.")}`);
    }

    const ext = imageFile.name.split(".").pop();
    const fileName = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      redirect(`/create-recipe?error=${encodeURIComponent("Failed to upload image. Please try again.")}`);
    }
    
    image_path = fileName;
  }

  // Insert recipe
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      author_id: userRes.user.id,
      title,
      slug,
      category: category,
      category_id: categoryId,
      description: description || null,
      ingredients,
      steps,
      prep_time_minutes: prepTime ? parseInt(String(prepTime)) : null,
      cook_time_minutes: cookTime ? parseInt(String(cookTime)) : null,
      servings: servings ? parseInt(String(servings)) : null,
      notes: notes || null,
      tips: tips || null,
      calories: calories ? parseInt(String(calories)) : null,
      protein_grams: proteinGrams ? parseFloat(String(proteinGrams)) : null,
      carbs_grams: carbsGrams ? parseFloat(String(carbsGrams)) : null,
      fat_grams: fatGrams ? parseFloat(String(fatGrams)) : null,
      fiber_grams: fiberGrams ? parseFloat(String(fiberGrams)) : null,
      image_path,
      published,
    })
    .select("id, slug")
    .single();

  if (recipeError || !recipe) {
    redirect(`/create-recipe?error=${encodeURIComponent("Failed to create recipe")}`);
  }

  // Insert tags
  if (tagIds.length > 0) {
    const tagInserts = tagIds.map((tagId) => ({
      recipe_id: recipe.id,
      tag_id: tagId,
    }));

    await supabase.from("recipe_tags").insert(tagInserts);
  }

  // Create activity
  await supabase.from("activities").insert({
    user_id: userRes.user.id,
    activity_type: forkRecipeId ? "recipe_forked" : "recipe_created",
    recipe_id: recipe.id,
  });

  // If forking, record the fork relationship
  if (forkRecipeId) {
    await supabase.from("recipe_forks").insert({
      original_recipe_id: forkRecipeId,
      forked_recipe_id: recipe.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/account");
  redirect(`/recipes/${recipe.slug}?success=Recipe created successfully!`);
}
