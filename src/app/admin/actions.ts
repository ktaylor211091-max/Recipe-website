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

async function requireSupabase() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(
      `/admin?error=${encodeURIComponent(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
      )}`,
    );
  }
  return supabase;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await requireSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await requireSupabase();
  await supabase.auth.signOut();
  revalidatePath("/admin");
  redirect("/admin");
}

export async function createRecipe(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ingredientsText = String(formData.get("ingredients") ?? "");
  const stepsText = String(formData.get("steps") ?? "");
  const published = formData.get("published") === "on";

  // Parse recipe metadata
  const prepTimeRaw = String(formData.get("prep_time_minutes") ?? "").trim();
  const cookTimeRaw = String(formData.get("cook_time_minutes") ?? "").trim();
  const servingsRaw = String(formData.get("servings") ?? "").trim();

  const prep_time_minutes = prepTimeRaw ? parseInt(prepTimeRaw, 10) : null;
  const cook_time_minutes = cookTimeRaw ? parseInt(cookTimeRaw, 10) : null;
  const servings = servingsRaw ? parseInt(servingsRaw, 10) : null;

  const imageFile = formData.get("image");

  if (!title) {
    redirect(`/admin?error=${encodeURIComponent("Title is required")}`);
  }

  if (!categoryId) {
    redirect(`/admin?error=${encodeURIComponent("Category is required")}`);
  }

  const slug = slugify(title);
  if (!slug) {
    redirect(`/admin?error=${encodeURIComponent("Could not create a slug")}`);
  }

  const supabase = await requireSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    redirect(`/admin?error=${encodeURIComponent("You must be signed in")}`);
  }

  const ingredients = splitLines(ingredientsText);
  const steps = splitLines(stepsText);

  let image_path: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > MAX_FILE_SIZE) {
      redirect(`/admin/dashboard?error=${encodeURIComponent("Image too large. Maximum size is 5MB. Please compress your image.")}`);  
    }
    const ext = (() => {
      const name = imageFile.name || "";
      const dot = name.lastIndexOf(".");
      const maybe = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
      return maybe && /^[a-z0-9]+$/.test(maybe) ? maybe : "bin";
    })();

    const objectPath = `recipes/${slug}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(objectPath, imageFile, {
        contentType: imageFile.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      redirect(`/admin?error=${encodeURIComponent(uploadError.message)}`);
    }

    image_path = objectPath;
  }

  const { error } = await supabase.from("recipes").insert({
    title,
    slug,
    category_id: categoryId,
    description: description || null,
    ingredients,
    steps,
    prep_time_minutes,
    cook_time_minutes,
    servings,
    image_path,
    published,
    author_id: user.id,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function updateRecipe(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ingredientsText = String(formData.get("ingredients") ?? "");
  const stepsText = String(formData.get("steps") ?? "");
  const published = formData.get("published") === "on";

  const prepTimeRaw = String(formData.get("prep_time_minutes") ?? "").trim();
  const cookTimeRaw = String(formData.get("cook_time_minutes") ?? "").trim();
  const servingsRaw = String(formData.get("servings") ?? "").trim();

  const prep_time_minutes = prepTimeRaw ? parseInt(prepTimeRaw, 10) : null;
  const cook_time_minutes = cookTimeRaw ? parseInt(cookTimeRaw, 10) : null;
  const servings = servingsRaw ? parseInt(servingsRaw, 10) : null;

  const imageFile = formData.get("image");

  if (!title) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Title is required")}`);
  }

  if (!categoryId) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Category is required")}`);
  }

  const slug = slugify(title);
  if (!slug) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("Could not create a slug")}`);
  }

  const supabase = await requireSupabase();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    redirect(`/admin/dashboard?error=${encodeURIComponent("You must be signed in")}`);
  }

  const ingredients = splitLines(ingredientsText);
  const steps = splitLines(stepsText);

  // Handle new image upload if provided
  let image_path: string | null | undefined = undefined; // undefined means "don't update"
  
  // Check if a new image file was uploaded
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (imageFile.size > MAX_FILE_SIZE) {
      redirect(`/admin/dashboard?error=${encodeURIComponent("Image too large. Maximum size is 5MB. Please compress your image.")}`);  
    }
    
    // Get existing recipe to check for old image
    const { data: existing } = await supabase
      .from("recipes")
      .select("image_path, slug")
      .eq("id", id)
      .maybeSingle();

    const ext = (() => {
      const name = imageFile.name || "";
      const dot = name.lastIndexOf(".");
      const maybe = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
      return maybe && /^[a-z0-9]+$/.test(maybe) ? maybe : "bin";
    })();

    const objectPath = `recipes/${slug}/${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(objectPath, imageFile, {
        contentType: imageFile.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      redirect(`/admin/dashboard?error=${encodeURIComponent(uploadError.message)}`);
    }

    // Delete old image if it exists
    if (existing?.image_path) {
      await supabase.storage.from("recipe-images").remove([existing.image_path]);
    }

    image_path = objectPath;
  }

  // Build update object - only include image_path if we're updating it
  const updateData: any = {
    title,
    slug,
    category_id: categoryId,
    description: description || null,
    ingredients,
    steps,
    prep_time_minutes,
    cook_time_minutes,
    servings,
    published,
  };

  if (image_path !== undefined) {
    updateData.image_path = image_path;
  }

  const { error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id);

  if (error) {
    redirect(`/admin/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/recipes/${slug}`);
  redirect("/admin/dashboard");
}

export async function togglePublish(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextPublished = String(formData.get("published") ?? "") === "true";

  const supabase = await requireSupabase();
  const { error } = await supabase
    .from("recipes")
    .update({ published: nextPublished })
    .eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function deleteRecipe(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await requireSupabase();

  // Best-effort: delete associated image from Storage first (if any).
  const { data: existing } = await supabase
    .from("recipes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const imagePath = existing?.image_path as string | null | undefined;
  if (imagePath) {
    await supabase.storage.from("recipe-images").remove([imagePath]);
  }

  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function removeRecipeImage(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await requireSupabase();

  const { data: existing, error: fetchError } = await supabase
    .from("recipes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    redirect(`/admin?error=${encodeURIComponent(fetchError.message)}`);
  }

  const imagePath = (existing?.image_path as string | null | undefined) ?? null;
  if (!imagePath) {
    revalidatePath("/admin");
    redirect("/admin");
  }

  const { error: removeError } = await supabase.storage
    .from("recipe-images")
    .remove([imagePath]);

  if (removeError) {
    redirect(`/admin?error=${encodeURIComponent(removeError.message)}`);
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ image_path: null })
    .eq("id", id);

  if (updateError) {
    redirect(`/admin?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}
