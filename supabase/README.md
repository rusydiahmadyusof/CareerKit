# Supabase migrations

Schema for CareerKit is versioned here. Apply migrations with one of these approaches:

## Option 1: Supabase Dashboard (quick)

1. Open your project at [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Run each migration in order (e.g. `20250305000001_create_resumes_and_applications.sql`, then `20250314000001_create_profiles.sql`).
3. Or copy-paste and run the scripts.

## Option 2: Supabase CLI

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link   # if not already linked
supabase db push
```

After applying, tables `resumes`, `applications`, and `profiles` exist with RLS; the app uses `auth.uid()` so users only see their own rows.
