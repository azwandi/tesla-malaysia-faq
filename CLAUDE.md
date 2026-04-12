# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

There are no automated tests in this project.

## Architecture

**React 18 + Vite + TypeScript SPA** deployed on Netlify, with Supabase as the backend (PostgreSQL + Auth).

### Data flow

All Supabase query functions live in `src/data/faqs.ts` and are called directly from pages/components via **TanStack Query** (`@tanstack/react-query`). There is no API layer — the frontend talks to Supabase directly using the client at `src/integrations/supabase/client.ts`. Types for the database schema are auto-generated in `src/integrations/supabase/types.ts`.

### Auth

`src/hooks/useAuth.tsx` provides an `AuthProvider` and `useAuth` hook wrapping Supabase Auth. Admin users must be manually created in the Supabase dashboard (Authentication → Users). There is no self-registration flow for admins. The `useAuth` hook must be used inside `AuthProvider` (already set up in `App.tsx`).

### Routing

Routes are defined in `src/App.tsx`:
- `/` — Homepage (featured FAQs + categories)
- `/search` — Full-text search results
- `/faq/:slug` — Individual FAQ detail page
- `/admin/login` — Admin login
- `/admin` — Admin dashboard (manage FAQs)
- `/admin/faq/new` and `/admin/faq/edit/:slug` — FAQ editor

The `Footer` is hidden on all `/admin/*` routes.

### UI components

`src/components/ui/` contains shadcn/ui primitives — do not edit these manually; regenerate via the shadcn CLI if updates are needed. Custom app components are directly in `src/components/`.

### Netlify function

`netlify/functions/ping.ts` is a scheduled function that pings the Supabase project periodically to prevent it from being paused due to inactivity.

## Environment variables

Copy `.env.example` to `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

Both are found in the Supabase project under **Settings → API**.

## Database

The `faqs` table has row-level security: public users can read `is_published = true` rows; authenticated users can write. Key columns: `slug` (unique URL key), `tags` (TEXT[]), `affected_models` (TEXT[]), `category` (one of 8 fixed values in `faqCategories` exported from `src/data/faqs.ts`), `competitor_info` (JSONB), `featured` (boolean).

The admin dashboard supports bulk CSV import with columns: `slug`, `question`, `answer`, `tags` (semicolon-separated), `affected_models` (semicolon-separated), `is_published` (`true`/`false`).
