"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteRecipe(slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return;
  
  // Verify user is the author
  const { data: recipe } = await supabase
    .from("recipes")
    .select("author_id")
    .eq("slug", slug)
    .single();
  
  if (recipe?.author_id === userRes.user.id) {
    await supabase
      .from("recipes")
      .delete()
      .eq("slug", slug);
    
    redirect("/account");
  }
}
