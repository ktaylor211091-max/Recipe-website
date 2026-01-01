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
  const description = String(formData.get("description") ?? "").trim();
  const ingredientsText = String(formData.get("ingredients") ?? "");
  const stepsText = String(formData.get("steps") ?? "");
  const published = formData.get("published") === "on";

  const imageFile = formData.get("image");

  if (!title) {
    redirect(`/admin?error=${encodeURIComponent("Title is required")}`);
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
    description: description || null,
    ingredients,
    steps,
    image_path,
    published,
    author_id: user.id,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
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
  redirect("/admin");
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
  redirect("/admin");
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
  redirect("/admin");
}
