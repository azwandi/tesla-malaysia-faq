# Tesla Malaysia FAQ

A community-driven FAQ platform for Tesla owners and prospective buyers in Malaysia. Covers topics like charging costs, government incentives, maintenance comparisons, Autopilot legality, and more — all tailored to local conditions.

**Live site: [jomtesla.my](https://jomtesla.my)**

## Features

- **Search** — Full-text search across questions and answers
- **Categories** — Browse by topic: Charging & Battery, Costs & Savings, Maintenance, Safety, Models & Variants, etc.
- **Tags** — Filter FAQs by tag or affected Tesla model
- **FAQ detail pages** — Individual pages with user feedback forms
- **Admin dashboard** — Manage FAQs with publish/draft/featured toggles and tag filters
- **Supabase backend** — Row-level security with public read access and admin-only write access
- **PostHog analytics** — Public pageviews plus FAQ, search, feedback, and referral tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Backend | Supabase (PostgreSQL + Auth) |
| Analytics | PostHog |
| Markdown | react-markdown, remark-gfm, rehype-sanitize |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```sh
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase `anon` public key |
| `VITE_POSTHOG_KEY` | Your PostHog project API key |
| `VITE_POSTHOG_HOST` | Your PostHog ingestion host, e.g. `https://us.i.posthog.com` |

Both values are found in your Supabase project under **Settings → API**.

For PostHog Cloud, the host usually matches your region:

- US: `https://us.i.posthog.com`
- EU: `https://eu.i.posthog.com`

> **Never commit `.env` to version control.** It is listed in `.gitignore`.

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd tesla-malaysia-faq

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for Production

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Analytics

The site sends PostHog events only in production builds when `VITE_POSTHOG_KEY` is present. Local development does not send analytics by default.

Tracked events:

- `$pageview` on public routes only
- `faq_viewed`
- `search_performed`
- `feedback_submitted`
- `referral_clicked`
- `tag_clicked`
- `category_clicked`
- `not_found_viewed`

Admin routes under `/admin/*` are excluded from analytics.

## Project Structure

```
src/
├── components/       # Shared UI components (SearchHero, FAQ, CategoriesSection, etc.)
├── pages/            # Route-level components
│   ├── Index.tsx         # Homepage
│   ├── FAQDetail.tsx     # Individual FAQ page
│   ├── SearchResults.tsx # Search results
│   ├── AdminLogin.tsx    # Admin login
│   ├── AdminDashboard.tsx # FAQ management
│   └── FAQEditor.tsx     # Create/edit FAQ
├── data/
│   └── faqs.ts       # Supabase query functions and FAQ categories
├── hooks/            # Custom React hooks (useAuth, etc.)
├── integrations/
│   └── supabase/     # Auto-generated Supabase client and types
└── lib/              # Utility functions
```

## Database Schema

The main `faqs` table in Supabase:

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `slug` | TEXT | URL-friendly identifier (unique) |
| `question` | TEXT | FAQ question |
| `answer` | TEXT | Markdown-formatted answer |
| `tags` | TEXT[] | Searchable tags |
| `affected_models` | TEXT[] | Relevant Tesla models |
| `category` | TEXT | One of 8 predefined categories |
| `competitor_info` | JSONB | Optional comparison data |
| `is_published` | BOOLEAN | Visibility on public site |
| `featured` | BOOLEAN | Shown on homepage |
| `created_at` | TIMESTAMPTZ | Auto-set on insert |
| `updated_at` | TIMESTAMPTZ | Auto-updated on change |

Row-level security is enabled: public users can read published FAQs; only users in the `admin_users` table can create, update, and delete.

## Admin Panel

Access the admin dashboard at `/admin/login`. Requires a Supabase authenticated account.

To create admin credentials:

1. Go to your Supabase project → **Authentication → Users → Add user**. Enter an email and password.
2. Copy the new user's UUID, then run in the Supabase SQL editor:
   ```sql
   INSERT INTO public.admin_users (user_id) VALUES ('<uuid>');
   ```

There is no self-registration; accounts must be created manually. Only users present in `admin_users` can write to the database.

Features:
- Filter FAQs by search query, tag, or publish status
- Toggle published/featured status per FAQ
- Create and edit FAQs with a rich form editor (drafts auto-saved to localStorage for 24 h)
- Review and resolve user feedback submissions

## FAQ Categories

- Buying & Ownership
- Charging & Battery
- Driving & Features
- Maintenance & Service
- Safety & Security
- Models & Variants
- Costs & Savings
- Fun & Extras

## Contributing

Content contributions are welcome. To suggest a new FAQ or report incorrect information, [open a GitHub issue](https://github.com/azwandi/tesla-malaysia-faq/issues/new) with your question and any relevant details.
