import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminClient } from "./AdminClient";
import {
  createRecipe,
  deleteRecipe,
  removeRecipeImage,
  signIn,
  signOut,
  togglePublish,
} from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const errorMessage =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
        ? sp.error[0]
        : "";

  return (
    <main>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Upload and manage recipes (coming next).
          </p>
        </div>
        <Link
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          href="/"
        >
          Back to home
        </Link>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Only admins can create recipes once roles are set up in Supabase.
          </p>

          <form action={signIn} className="mt-4 space-y-3">
            <label className="block">
              <div className="text-sm font-medium">Email</div>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Password</div>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-800"
            >
              Sign in
            </button>
          </form>

          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Sign out
            </button>
          </form>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Create recipe</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            New recipes start as drafts unless you publish them.
          </p>

          <form action={createRecipe} className="mt-4 space-y-3">
            <label className="block">
              <div className="text-sm font-medium">Title</div>
              <input
                name="title"
                required
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Description</div>
              <textarea
                name="description"
                rows={3}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Ingredients (one per line)</div>
              <textarea
                name="ingredients"
                rows={5}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <div className="text-sm font-medium">Steps (one per line)</div>
              <textarea
                name="steps"
                rows={6}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium">Image (optional)</div>
              <input
                name="image"
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
              <div className="mt-1 text-xs text-neutral-500">
                Best results: JPG/PNG/WebP.
              </div>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="published" type="checkbox" className="h-4 w-4" />
              Publish now
            </label>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-800"
            >
              Create
            </button>
          </form>
        </div>
      </section>

      <AdminRecipes />

      <div className="mt-6">
        <AdminClient />
      </div>
    </main>
  );
}

async function AdminRecipes() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Your recipes</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Supabase is not configured. Set Vercel env vars
          <b> NEXT_PUBLIC_SUPABASE_URL</b> and
          <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>, then redeploy.
        </p>
      </section>
    );
  }
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  const { data: roleRow } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isAdmin = roleRow?.role === "admin";

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,title,slug,published,created_at,image_path")
    .order("created_at", { ascending: false });

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-base font-semibold">Your recipes</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Signed in as: {user?.email ?? "(not signed in)"} · Role:{" "}
            {roleRow?.role ?? "(unknown)"}
          </p>
          {!user ? (
            <p className="mt-2 text-sm text-neutral-600">
              Sign in to manage recipes.
            </p>
          ) : !isAdmin ? (
            <p className="mt-2 text-sm text-neutral-600">
              Your account is not an admin yet. Set your role to <b>admin</b> in
              Supabase profiles.
            </p>
          ) : null}
        </div>
        <Link className="text-sm underline" href="/">
          View public site
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="mt-4 text-sm text-neutral-600">No recipes yet.</div>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {recipes.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                {r.image_path ? (
                  <img
                    src={
                      supabase.storage
                        .from("recipe-images")
                        .getPublicUrl(r.image_path).data.publicUrl
                    }
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-neutral-200 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-md border border-neutral-200 bg-neutral-50" />
                )}

                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">/{r.slug}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/recipes/${r.slug}`}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                >
                  Open
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
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                  >
                    {r.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <form action={deleteRecipe}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                  >
                    Delete
                  </button>
                </form>

                {r.image_path ? (
                  <form action={removeRecipeImage}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
                    >
                      Remove image
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
