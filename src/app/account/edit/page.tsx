import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function EditProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) {
    redirect("/login");
  }

  const user = userRes.user;

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, location, website, is_public")
    .eq("id", user.id)
    .single();

  return (
    <main className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Edit Profile
        </h1>
        <p className="mt-2 text-neutral-600">
          Update your profile information and settings
        </p>
      </div>

      <div className="max-w-2xl">
        <form action={updateProfile} className="space-y-6">
          {/* Display Name */}
          <div>
            <label
              htmlFor="display_name"
              className="block text-sm font-medium text-neutral-700"
            >
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              defaultValue={profile?.display_name || ""}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="How you want to be called"
            />
            <p className="mt-1 text-sm text-neutral-500">
              This is how others will see your name on the site
            </p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email || ""}
              disabled
              className="mt-1 block w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-neutral-500"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Email cannot be changed
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-neutral-700"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ""}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Tell us about yourself and your cooking style"
            />
            <p className="mt-1 text-sm text-neutral-500">
              A brief description about you
            </p>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={profile?.location || ""}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g., New York, NY"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Where you&apos;re cooking from
            </p>
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-neutral-700"
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              defaultValue={profile?.website || ""}
              className="mt-1 block w-full rounded-lg border border-neutral-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://yourwebsite.com"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Your personal website or blog
            </p>
          </div>

          {/* Profile Visibility */}
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                defaultChecked={profile?.is_public !== false}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
              <div>
                <div className="text-sm font-medium text-neutral-700">
                  Public Profile
                </div>
                <p className="text-sm text-neutral-500">
                  Allow others to find and view your profile
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Save Changes
            </button>
            <a
              href="/account"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
