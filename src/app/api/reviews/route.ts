import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { recipeId, rating, reviewText } = await request.json();

    if (!recipeId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Valid recipe ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 }
      );
    }

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Insert or update review
    const { error } = await supabase
      .from("recipe_reviews")
      .upsert({
        user_id: userRes.user.id,
        recipe_id: recipeId,
        rating,
        review_text: reviewText || null,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Same as POST - upsert handles both
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 }
      );
    }

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Delete review
    const { error } = await supabase
      .from("recipe_reviews")
      .delete()
      .eq("user_id", userRes.user.id)
      .eq("recipe_id", recipeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
