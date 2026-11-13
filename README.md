# REBUILD

Desktop-first personal growth app. React + Vite + Supabase. **Status: Phase 1 (foundation).**

## 1. Local development
```
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

## 2. Supabase setup
1. Create a project at supabase.com (free tier).
2. Project Settings > API: copy the **Project URL** and the **publishable (anon) key** into `.env`.
   Never use the `service_role` / secret key in this app.
3. SQL Editor: run `supabase/migrations/0001_schema.sql`, then `0002_rls.sql`.
4. SQL Editor: run `supabase/tests/rls_tests.sql`. You must see `ALL RLS TESTS PASSED`.

## 3. Authentication
- Authentication > URL Configuration: set Site URL to your Netlify URL; add `http://localhost:5173` and `<site>/reset-password` to Redirect URLs.
- Authentication > Email provider: keep "Confirm email" on.
- **After creating your own account:** turn off "Allow new users to sign up" in the Supabase dashboard (the real lock). Optionally set `VITE_ALLOW_SIGNUP=false` to hide the form.

## 4. Deploy (GitHub + Netlify)
1. Push this folder to a GitHub repo (`.env` is git-ignored).
2. Netlify > Add site > Import from Git. Build `npm run build`, publish `dist` (already in `netlify.toml`, with SPA rewrite).
3. Site settings > Environment variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (and optionally `VITE_ALLOW_SIGNUP`).
