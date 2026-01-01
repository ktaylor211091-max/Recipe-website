# Recipe Website

Next.js recipe website with an admin page for uploading recipes.

## Local setup

### 1) Install

```bash
npm install
```

### 2) Configure Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. In Supabase Dashboard → SQL Editor:
	- Run `supabase/schema.sql`
	- If you already ran it earlier, re-run it to apply the new `category` column migration
4. In Supabase Dashboard → Storage:
	- Create a bucket named `recipe-images`
	- If you want images to load via public URLs, set the bucket to **Public**
	- Run `supabase/storage.sql` in SQL Editor
5. Create an Auth user (email/password).
6. Promote that user to admin:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_USER_ID';
```

### 3) Run dev server

```bash
npm run dev
```

Open http://localhost:3000

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel → New Project → import the repo.
3. Set environment variables in Vercel (same keys as `.env.local`).
4. Deploy.
