"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  const displayName = formData.get("display_name") as string;
  const bio = formData.get("bio") as string;
  const location = formData.get("location") as string;
  const website = formData.get("website") as string;
  const isPublic = formData.get("is_public") === "on";

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userRes.user.id,
      display_name: displayName || null,
      bio: bio || null,
      location: location || null,
      website: website || null,
      is_public: isPublic,
      role: "user",
    });

  if (error) {
    console.error("Error updating profile:", error);
    redirect("/account/edit?error=Failed to update profile");
  }

  redirect("/account?success=Profile updated successfully");
}
