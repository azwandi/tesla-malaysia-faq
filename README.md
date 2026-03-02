# Tesla Malaysia FAQ

A community-driven FAQ platform for Tesla owners and prospective buyers in Malaysia. Covers topics like charging costs, government incentives, maintenance comparisons, Autopilot legality, and more — all tailored to local conditions.

**Live site: [jomtesla.my](https://jomtesla.my)**

## Features

- **Search** — Full-text search across questions and answers
- **Categories** — Browse by topic: Charging & Battery, Costs & Savings, Maintenance, Safety, Models & Variants, etc.
- **Tags** — Filter FAQs by tag or affected Tesla model
- **FAQ detail pages** — Individual pages with user feedback forms
- **Admin dashboard** — Manage FAQs with publish/draft/featured toggles, tag filters, and bulk CSV import
- **Supabase backend** — Row-level security with public read access and authenticated write access

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Backend | Supabase (PostgreSQL + Auth) |
| Markdown | react-markdown, remark-gfm |

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

Both values are found in your Supabase project under **Settings → API**.

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

Row-level security is enabled: public users can read published FAQs, authenticated users can create, update, and delete.

## Admin Panel

Access the admin dashboard at `/admin/login`. Requires a Supabase authenticated account.

Features:
- Filter FAQs by search query, tag, or publish status
- Toggle published/featured status per FAQ
- Create and edit FAQs with a rich form editor
- **Bulk CSV import** — Upload a `.csv` file with columns: `slug`, `question`, `answer`, `tags` (semicolon-separated), `affected_models` (semicolon-separated), `is_published` (`true`/`false`)
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
