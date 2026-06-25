import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

// Canonical site origin (no trailing slash). Kept in sync with the
// hardcoded URLs in index.html and src/pages/FAQDetail.tsx.
const SITE_URL = 'https://jomtesla.heimastudio.xyz';

// Static routes that always belong in the sitemap.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/search', changefreq: 'weekly', priority: '0.8' },
];

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = (
  path: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {}
): string => {
  const parts = [`    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`];
  if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (opts.priority) parts.push(`    <priority>${opts.priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
};

const buildSitemap = (entries: string[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${entries.join('\n')}\n` +
  `</urlset>\n`;

export const handler = async () => {
  const entries = STATIC_ROUTES.map(({ path, changefreq, priority }) =>
    urlEntry(path, { changefreq, priority })
  );

  // RLS already restricts the anon key to published rows, but we filter
  // explicitly so the intent is clear and robust to policy changes.
  const { data, error } = await supabase
    .from('faqs')
    .select('slug, updated_at, created_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    // Fall back to a valid sitemap with the static routes rather than a 500,
    // so crawlers always get a well-formed document.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
      body: buildSitemap(entries),
    };
  }

  for (const faq of data ?? []) {
    if (!faq.slug) continue;
    const lastmodSource = faq.updated_at ?? faq.created_at;
    const lastmod = lastmodSource
      ? new Date(lastmodSource).toISOString().split('T')[0]
      : undefined;
    entries.push(
      urlEntry(`/faq/${encodeURIComponent(faq.slug)}`, {
        lastmod,
        changefreq: 'monthly',
        priority: '0.7',
      })
    );
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
    body: buildSitemap(entries),
  };
};
