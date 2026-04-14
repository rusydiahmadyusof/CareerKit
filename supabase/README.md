# Database migrations

Schema for CareerKit is versioned here. These SQL files can be applied in Neon or any PostgreSQL host.

## Option 1: Neon SQL Editor (quick)

1. Open your project in Neon → **SQL Editor**.
2. Run each migration in order (`20260414000001_neon_auth.sql`, then `careerkit_fresh.sql`).

## Option 2: psql CLI

If you use `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260414000001_neon_auth.sql
psql "$DATABASE_URL" -f supabase/migrations/careerkit_fresh.sql
```

After applying, app tables `app_users`, `app_sessions`, and `password_reset_tokens` are available, plus `resumes`, `applications`, and `profiles`.

Validate bootstrap:

```bash
npm run verify:neon-bootstrap
```
