import { useParams, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Car, Zap, Settings, ExternalLink, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFAQBySlug, fetchRelatedFAQs, FAQ } from "@/data/faqs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { FeedbackForm } from "@/components/FeedbackForm";
import { REFERRAL_URL, REFERRAL_DISCOUNT, PURCHASE_INTENT_CATEGORIES, PURCHASE_INTENT_TAGS } from "@/lib/referral";
import { trackEvent } from "@/lib/analytics";

export default function FAQDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [relatedFAQs, setRelatedFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFAQ = async () => {
      if (slug) {
        const data = await getFAQBySlug(slug);
        setFaq(data);
        if (data) {
          const related = await fetchRelatedFAQs(slug, data.tags, data.category);
          setRelatedFAQs(related);
        }
      }
      setLoading(false);
    };
    loadFAQ();
  }, [slug]);

  useEffect(() => {
    if (!faq) return;

    trackEvent("faq_viewed", {
      faq_id: faq.id,
      slug: faq.slug,
      category: faq.category,
      tags: faq.tags.join(","),
    });
  }, [faq]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!slug) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-3/4 bg-muted rounded" />
            <div className="h-10 w-1/2 bg-muted rounded" />
            <div className="mt-8 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-muted rounded w-full" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!faq) return <Navigate to="/" replace />;

  const handleBackNavigation = () => {
    if (location.state?.fromSearch) {
      const params = new URLSearchParams();
      if (location.state.searchQuery) params.set('q', location.state.searchQuery);
      if (location.state.searchTag) params.set('tag', location.state.searchTag);
      if (location.state.searchCategory) params.set('category', location.state.searchCategory);
      navigate(params.toString() ? `/search?${params.toString()}` : '/search');
    } else {
      navigate('/');
    }
  };

  const isHighIntent =
    PURCHASE_INTENT_CATEGORIES.includes(faq.category) ||
    faq.tags.some(t => PURCHASE_INTENT_TAGS.includes(t));

  const plainAnswer = faq.answer.replace(/[#*`]/g, '');
  const description = plainAnswer.slice(0, 155).trim() + '…';
  const pageTitle = `${faq.question} | JomTesla`;
  const pageUrl = `https://jomtesla.my/faq/${faq.slug}`;
  const handleReferralClick = (placement: "faq_high_intent" | "faq_low_intent") => {
    trackEvent("referral_clicked", {
      faq_slug: faq.slug,
      category: faq.category,
      placement,
      high_intent: isHighIntent,
    });
  };
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: plainAnswer },
    }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      {/* Navigation bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex justify-between items-center">
          <button
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {user && (
            <Link to={`/admin/faq/edit/${faq.slug}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 animate-fade-up">
          <Link to="/" className="hover:text-foreground transition-colors">JomTesla</Link>
          <ChevronRight className="w-3 h-3" />
          {faq.category && (
            <>
              <Link
                to={`/search?category=${encodeURIComponent(faq.category)}`}
                className="hover:text-foreground transition-colors"
              >
                {faq.category}
              </Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground/50 truncate max-w-[200px]">{faq.question.slice(0, 40)}…</span>
        </div>

        {/* Question headline */}
        <div className="mb-8 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            {faq.category && (
              <Badge variant="secondary" className="text-xs font-medium">
                {faq.category}
              </Badge>
            )}
          </div>

          <h1 className="font-sans text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-foreground">
            {faq.question}
          </h1>
        </div>

        {/* Affected Models + Tags */}
        {((faq.affected_models && faq.affected_models.length > 0) || (faq.tags && faq.tags.length > 0)) && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border animate-fade-up stagger-2">
            {faq.affected_models?.map((model) => (
              <span
                key={model}
                className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full"
              >
                <Car className="w-3 h-3" />
                {model}
              </span>
            ))}
            {faq.tags?.map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-xs font-medium bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground px-2.5 py-1 rounded-full transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Answer — prose-reading class applies Lora serif */}
        <div className="prose-reading animate-fade-up stagger-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              p: ({ children }) => (
                <p className="mb-5 leading-[1.85] text-foreground/90 text-lg">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic">{children}</em>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
              ),
              h1: ({ children }) => (
                <h1 className="font-sans text-2xl font-bold text-foreground mb-4 mt-8">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-sans text-xl font-bold text-foreground mb-3 mt-7">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2 mt-6">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-6 mb-5 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-6 mb-5 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed text-foreground/90 text-lg">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-[3px] border-primary pl-5 italic text-foreground/70 mb-5 bg-primary/5 py-3 pr-4 rounded-r-sm">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-all"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-md border border-border shadow-sm">
                  <table className="w-full text-sm border-collapse font-sans">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/70">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-border">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs uppercase tracking-wide border-b border-border">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-foreground/85 align-top leading-relaxed">
                  {children}
                </td>
              ),
            }}
          >
            {faq.answer}
          </ReactMarkdown>
        </div>

        {/* Competitor info */}
        {faq.competitor_info && (
          <div className="mt-8 p-5 rounded-md bg-muted/50 border border-border animate-fade-up stagger-4">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Competitive Advantage</h3>
            </div>
            <div className="space-y-2 text-sm">
              {Object.entries(faq.competitor_info).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium capitalize text-muted-foreground min-w-[80px]">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="text-foreground/85">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral CTA */}
        {isHighIntent ? (
          <div className="mt-10 rounded-md border border-primary/25 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up stagger-4">
            <div>
              <p className="font-semibold text-foreground mb-1">Ready to order your Tesla?</p>
              <p className="text-sm text-muted-foreground">
                Use my referral link and get <span className="font-semibold text-foreground">{REFERRAL_DISCOUNT} off</span> — and help keep this site running.
              </p>
            </div>
            <a
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleReferralClick("faq_high_intent")}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-5 py-2.5 rounded text-sm font-semibold"
            >
              Order with Referral
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="mt-10 flex items-center justify-between gap-4 rounded border border-border bg-muted/30 px-5 py-3 animate-fade-up stagger-4">
            <p className="text-sm text-muted-foreground">
              Thinking of buying a Tesla? Get <span className="font-medium text-foreground">{REFERRAL_DISCOUNT} off</span> with my referral link.
            </p>
            <a
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleReferralClick("faq_low_intent")}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Claim <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Feedback */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="font-semibold mb-1.5">Was this helpful?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help us improve this content for fellow Malaysians.
            </p>
            <FeedbackForm faqId={faq.id} faqSlug={faq.slug} />
          </div>
        </div>

        {/* Related FAQs */}
        {relatedFAQs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-semibold mb-5">Related Questions</h3>
            <div className="space-y-0 divide-y divide-border">
              {relatedFAQs.map((related) => (
                <Link
                  key={related.slug}
                  to={`/faq/${related.slug}`}
                  className="group flex items-center justify-between gap-4 py-4 hover:text-primary transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{related.question}</p>
                    {related.category && (
                      <span className="text-xs text-muted-foreground mt-0.5 inline-block">{related.category}</span>
                    )}
                  </div>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground/40 rotate-180 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row gap-3 justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Button>
          </Link>
          <Link to="/search">
            <Button size="sm" className="gap-2">
              Browse All Questions
              <Zap className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
