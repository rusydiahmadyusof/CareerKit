# CareerKit

Build resumes and track job applications in one place.

## Stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **Supabase** (Auth, Postgres) — configure via env

## Run locally

1. Copy env: `cp .env.example .env` (or copy `.env.example` to `.env`).
2. Fill in Supabase values in `.env` (from [Supabase dashboard](https://supabase.com/dashboard)).
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Env vars

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

## Deploy

Connect this repo to [Vercel](https://vercel.com); set the env vars in the project settings. Deploys on push to main.

## Docs

Product and planning docs are in `docs/` (see `docs/README.md`). The `docs/` folder is not tracked in git.
