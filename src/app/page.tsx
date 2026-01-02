import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecipeListClient } from "./RecipeListClient";

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  image_path: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
};

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const { data: recipes } = supabase
    ? await supabase
        .from("recipes")
        .select("id,title,slug,category,description,image_path,prep_time_minutes,cook_time_minutes,servings,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .returns<RecipeRow[]>()
    : { data: null };

  return (
    <main className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 p-12 text-white shadow-2xl animate-fade-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRoMTZ2NDBINDBjLTIuMjEgMC00LTEuNzktNC00VjM0em0wLTMwVjBIMHY0aDM2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6 animate-slide-in">
            Discover Delicious Recipes
          </h1>
          <p className="text-xl leading-relaxed text-indigo-100 mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Explore our curated collection of mouth-watering recipes. From quick weeknight dinners to impressive desserts.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">Easy to Follow</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">Quick & Simple</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-sm">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-medium">Tried & Tested</span>
            </div>
          </div>
        </div>

        {!supabase ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <strong>Configuration Required:</strong> Set Vercel env vars
            <b> NEXT_PUBLIC_SUPABASE_URL</b> and
            <b> NEXT_PUBLIC_SUPABASE_ANON_KEY</b>.
          </div>
        ) : null}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
            Browse Recipes
          </h2>
        </div>

        {!recipes || recipes.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto h-16 w-16 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No recipes yet</h3>
            <p className="text-neutral-500">Check back soon for delicious recipes!</p>
          </div>
        ) : (
          <RecipeListClient
            recipes={recipes}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
            bucketName="recipe-images"
          />
        )}
      </section>
    </main>
  );
}
