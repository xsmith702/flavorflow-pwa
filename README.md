# Food Recipe & Pantry App

A Next.js (App Router, TypeScript) app for shared pantry management and recipe discovery, built mobile-first with Zustand state and optional Supabase sync.

## Stack

- Next.js 15 + TypeScript
- TailwindCSS v4 (via @tailwindcss/postcss)
- Zustand (state)
- Supabase (auth + sync) — optional
- Vitest + RTL (tests)

## Quick start

1. Copy envs:

```
cp .env.local.example .env.local
```

2. Dev server:

```
npm run dev
```

3. Tests:

```
npm test
```

## Configure Supabase (optional)

- Create a new Supabase project and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Run the SQL below in the Supabase SQL editor.

### SQL schema

```sql
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists pantry_items (
  id uuid primary key,
  household_id uuid references households(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  unit text,
  category_id uuid,
  expires_at date,
  low_stock_threshold int,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- favorites recipes
create table if not exists recipe_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recipe_id text not null,
  title text,
  image text,
  source_url text,
  created_at timestamp with time zone default now()
);
```

> Add RLS policies appropriate for your app (e.g., per-household access). For quick prototyping you can leave RLS off.

## Project structure

- `src/features/pantry` — store, components, sync
- `src/features/recipes` — API + search UI
- `src/features/auth` — session hook
- `src/components/ui` — small UI primitives

## Design

- Deep teal + warm neutrals; accessible interactive states and keyboard focus rings.
- Low stock and expiring badges provide quick status signals.

## Mobile

- Layouts are responsive; components are sized for touch. This base can be ported to React Native later.

## Notes

- The recipe API uses TheMealDB (no key needed). You can later wire Spoonacular/Edamam via envs.
- Without Supabase envs set, Sync is a no-op.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
