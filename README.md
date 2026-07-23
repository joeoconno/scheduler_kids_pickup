# HabitHarmony

[![CI](https://github.com/joeoconno/scheduler_kids_pickup/actions/workflows/ci.yml/badge.svg)](https://github.com/joeoconno/scheduler_kids_pickup/actions/workflows/ci.yml)

A calm mindfulness and personal-growth app for individuals or couples: dual calendars (personal + shared), an AI-assisted auto-scheduler, a bidirectional points/rewards store, daily reflection journaling, and a weekly progress dashboard.

## Stack

- Next.js 16 (App Router), TypeScript, Server Actions
- Prisma + PostgreSQL
- NextAuth (Auth.js v5) credentials auth
- Claude API (`@anthropic-ai/sdk`) for the Auto-Generate scheduler
- Tailwind CSS v4

## Getting started

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a PostgreSQL connection string
   - `AUTH_SECRET` — any long random string
   - `ANTHROPIC_API_KEY` — required for the Auto-Generate feature; everything else works without it
2. Install dependencies and set up the database:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed   # optional demo data: alex@example.com / sam@example.com, password123
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run db:migrate` — Prisma migrate (dev)
- `npm run db:seed` — seed demo data

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request: install, lint, type-check, unit tests, a Prisma migration validation against a throwaway Postgres service container, and a production build.

There's no GitHub Pages deployment here — Pages only serves static files, and this app needs a live Postgres database, server actions, session auth, and server-side Claude API calls, none of which Pages can run. Deploy it to a platform that runs a Node server instead (e.g. Vercel, Railway, Fly.io, Render), with `DATABASE_URL`, `AUTH_SECRET`, and `ANTHROPIC_API_KEY` set as environment variables there.

## Current scope

Implemented: auth + invite-code partner pairing, personal & shared calendars (manual entries + recurrence + AI auto-generate), practice checklists, personal & shared rewards store with appreciation points, daily reflection journal, and a weekly growth dashboard.

Not yet built (planned follow-up): push notifications, passcode/biometric lock, intention tracker, and the goal wishlist.
