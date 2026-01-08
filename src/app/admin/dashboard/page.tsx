import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategories } from "../categories/actions";

import { AdminClient } from "../AdminClient";
import {
  createRecipe,
  deleteRecipe,
  removeRecipeImage,
  signOut,
  togglePublish,
  getTags,
} from "../actions";

async function AdminRecipes() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
        Supabase is not configured. Set Vercel env vars
        <b> NEXT_PUBLIC_SUPABASE_URL</b> and
        <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>, then redeploy.
      </div>
    );
  }

  const { data: userRes } = await supabase.auth.getUser();
  const profile = userRes?.user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user.id)
        .single()
    : null;

  const role = profile?.data?.role ?? "(unknown)";
  
  const [recipes] = await Promise.all([
    supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => data),
    getCategories(),
  ]);

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Your recipes</h2>
          <Link
            href="/admin/categories"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Manage Categories
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-neutral-600">
          <span>
            Signed in as: <b>{userRes?.user?.email ?? "(not signed in)"}</b>
          </span>
          <span>·</span>
          <span>
            Role: <b>{role}</b>
          </span>
        </div>

        {role !== "admin" ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            You are not an admin. Ask the site owner to set your role in
            Supabase profiles.
          </div>
        ) : null}

        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
          >
            Sign out
          </button>
        </form>

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View public site →
          </Link>
        </div>

        {!recipes || recipes.length === 0 ? (
          <div className="mt-6 text-sm text-neutral-600">No recipes yet.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {recipes.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              >
                {r.image_path ? (
                  <div className="relative h-20 w-20 rounded-md border border-neutral-200 overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        supabase.storage
                          .from("recipe-images")
                          .getPublicUrl(r.image_path).data.publicUrl
                      }
                      alt={r.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-xs text-neutral-500">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        /{r.slug} · {r.category ?? "General"}
                      </div>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-1 text-xs font-medium">
                      {r.published ? "Published" : "Draft"}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/dashboard/edit/${r.id}`}
                      className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Edit
                    </Link>

                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="published"
                        value={String(!r.published)}
                      />
                      <button
                        type="submit"
                        className="rounded border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        {r.published ? "Unpublish" : "Publish"}
                      </button>
                    </form>

                    <form action={deleteRecipe}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>

                    {r.image_path ? (
                      <form action={removeRecipeImage}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          Remove image
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-sm font-semibold">Status</h3>
        <p className="mt-2 text-xs leading-5 text-neutral-600">
          Supabase is configured if this page loads without an environment
          variable error.
        </p>

        <div className="mt-3">
          <AdminClient />
        </div>
      </div>
    </>
  );
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  
  // Check if signed in
  if (supabase) {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      // Not signed in, redirect to login
      redirect("/admin");
    }
  } else {
    redirect("/admin");
  }

  // Fetch categories and tags for the create form
  const categories = await getCategories();
  const tags = await getTags();

  return (
    <main>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage your recipes
          </p>
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Create recipe</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            New recipes start as drafts unless you publish them.
          </p>

          <form action={createRecipe} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Title
              </label>
              <input
                name="title"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Category *
              </label>
              <select
                name="category"
                required
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Prep Time (minutes)
                </label>
                <input
                  name="prep_time_minutes"
                  type="number"
                  min="0"
                  placeholder="15"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Cook Time (minutes)
                </label>
                <input
                  name="cook_time_minutes"
                  type="number"
                  min="0"
                  placeholder="30"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Servings
                </label>
                <input
                  name="servings"
                  type="number"
                  min="1"
                  placeholder="4"
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Ingredients (one per line)
              </label>
              <textarea
                name="ingredients"
                rows={6}
                required
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Steps (one per line)
              </label>
              <textarea
                name="steps"
                rows={8}
                required
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Additional notes or comments about this recipe..."
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Tips (optional)
              </label>
              <textarea
                name="tips"
                rows={3}
                placeholder="Helpful tips for making this recipe..."
                className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag.id}
                      className="rounded border-neutral-300"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                Nutritional Information (optional, per serving)
              </h3>
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600">
                    Calories
                  </label>
                  <input
                    name="calories"
                    type="number"
                    min="0"
                    placeholder="250"
                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600">
                    Protein (g)
                  </label>
                  <input
                    name="protein_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="20"
                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600">
                    Carbs (g)
                  </label>
                  <input
                    name="carbs_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="30"
                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600">
                    Fat (g)
                  </label>
                  <input
                    name="fat_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="10"
                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600">
                    Fiber (g)
                  </label>
                  <input
                    name="fiber_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="5"
                    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <input
                  name="published"
                  type="checkbox"
                  className="rounded border-neutral-300"
                />
                <span>Publish immediately</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Image (optional)
              </label>
              <input
                name="image"
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Best results: JPG/PNG/WebP. Max 5MB.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Create
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <AdminRecipes />
        </div>
      </section>
    </main>
  );
}
