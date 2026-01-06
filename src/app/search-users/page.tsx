import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

interface SearchUsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchUsersPage({ searchParams }: SearchUsersPageProps) {
  const { q: query } = await searchParams;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: userRes } = await supabase.auth.getUser();
  const currentUserId = userRes?.user?.id;

  let profiles: any[] = [];

  if (query && query.trim()) {
    const searchQuery = query.toLowerCase();
    const profileIdSet = new Set<string>();

    // Search for profiles by display name
    const { data: profilesByName } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url, is_public")
      .eq("is_public", true)
      .ilike("display_name", `%${query}%`)
      .limit(20);

    // Add matching profiles to set
    if (profilesByName) {
      profilesByName.forEach(p => profileIdSet.add(p.id));
    }

    // Search for users by email using auth admin API
    const { data: allUsersData } = await supabase.auth.admin.listUsers();
    if (allUsersData?.users) {
      const matchingUserIds = allUsersData.users
        .filter(user => user.email?.toLowerCase().includes(searchQuery))
        .map(user => user.id)
        .slice(0, 20);

      // Get profiles for matching emails
      if (matchingUserIds.length > 0) {
        const { data: profilesByEmail } = await supabase
          .from("profiles")
          .select("id, display_name, bio, avatar_url, is_public")
          .eq("is_public", true)
          .in("id", matchingUserIds);

        if (profilesByEmail) {
          profilesByEmail.forEach(p => profileIdSet.add(p.id));
        }
      }
    }

    // Get full profile data for all matches
    if (profileIdSet.size > 0) {
      const profileIds = Array.from(profileIdSet).slice(0, 20);
      const { data: allMatchingProfiles } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url, is_public")
        .eq("is_public", true)
        .in("id", profileIds);

      if (allMatchingProfiles) {
        // Get user emails and recipe counts
        const profilesWithDetails = await Promise.all(
          allMatchingProfiles.map(async (profile) => {
            const [userData, recipesData] = await Promise.all([
              supabase.auth.admin.getUserById(profile.id),
              supabase
                .from("recipes")
                .select("id", { count: "exact", head: true })
                .eq("author_id", profile.id)
                .eq("published", true),
            ]);

            return {
              ...profile,
              email: userData.data?.user?.email,
              recipeCount: recipesData.count || 0,
            };
          })
        );

        profiles = profilesWithDetails;
      }
    }
  }

  return (
    <main className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Find Chefs
        </h1>
        <p className="mt-2 text-neutral-600">
          Search by name or email to discover other cooks and their recipes
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <form action="/search-users" method="get" className="max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query || ""}
              placeholder="Search by name or email..."
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {query && (
        <>
          {profiles.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                No chefs found
              </h2>
              <p className="text-neutral-600">
                Try a different search term or browse all recipes
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-neutral-600">
                Found {profiles.length} chef{profiles.length !== 1 ? "s" : ""}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-bold text-white">
                        {(profile.display_name || profile.email || "U")[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-neutral-900 truncate">
                          {profile.display_name || "Anonymous Chef"}
                        </h3>
                        {profile.email && (
                          <p className="text-xs text-neutral-500 truncate">
                            @{profile.email.split("@")[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span className="font-medium">{profile.recipeCount}</span>{" "}
                        recipe{profile.recipeCount !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/profile/${profile.id}`}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                      >
                        View Profile
                      </Link>
                      {currentUserId && currentUserId !== profile.id && (
                        <Link
                          href={`/messages?user=${profile.id}`}
                          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {!query && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Discover Chefs
          </h2>
          <p className="text-neutral-600 mb-6">
            Search for other cooks by name or email to discover their recipes and connect
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search by name or email
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View profiles
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Send messages
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
