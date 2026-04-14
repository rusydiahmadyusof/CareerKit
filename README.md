# CareerKit

Build resumes and track job applications in one place.

## Screenshot
![CareerKit dashboard screenshot](./careerkit.png)

## Stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **Neon Postgres** (database) + app-managed auth/session tables

## Run locally

1. Copy env:
   - Windows (PowerShell): `Copy-Item .env.example .env.local`
   - macOS/Linux: `cp .env.example .env.local`
2. Fill in database and auth values in `.env.local`.
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Neon setup (migrations)

For a fresh Neon database, run SQL files from `supabase/migrations/` in this order:

1. `20260414000001_neon_auth.sql`
2. `careerkit_fresh.sql`

You can run these via `psql` or Neon SQL editor, then validate:

```bash
npm run verify:neon-bootstrap
```

## Env vars

| Variable                        | Required | Description                                              |
| ------------------------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL`                  | Yes      | Neon Postgres connection string                          |
| `GROQ_API_KEY`                  | No       | For tailor-to-job and ATS scoring (AI). Prefer Groq.      |
| `OPENAI_API_KEY`                | No       | Alternative for tailor/ATS if Groq is not set.           |

## Password reset

Password reset is token-based via `password_reset_tokens`. By default, reset links are returned directly in the forgot-password response for manual delivery during early rollout.

## Deploy

Connect this repo to [Vercel](https://vercel.com); set the env vars in the project settings. Deploys on push to `main`.

For production cutover and rollback steps, see `NEON_MIGRATION.md`.
For runtime health and incident handling, see `OPERATIONS_RUNBOOK.md`.

## Docs

Product and planning docs are in `docs/` (see `docs/README.md`). The `docs/` folder is not tracked in git.
