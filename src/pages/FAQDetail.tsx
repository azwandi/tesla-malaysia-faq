import { useParams, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Car, Tag, Lightbulb, Zap, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFAQBySlug, fetchRelatedFAQs, FAQ } from "@/data/faqs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FeedbackForm } from "@/components/FeedbackForm";

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
    window.scrollTo(0, 0);
  }, []);

  if (!slug) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading FAQ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!faq) {
    return <Navigate to="/" replace />;
  }

  // Function to handle back navigation
  const handleBackNavigation = () => {
    // Check if user came from search results page
    if (location.state?.fromSearch) {
      // Reconstruct the search URL with all parameters
      const params = new URLSearchParams();
      
      if (location.state.searchQuery) {
        params.set('q', location.state.searchQuery);
      }
      if (location.state.searchTag) {
        params.set('tag', location.state.searchTag);
      }
      if (location.state.searchCategory) {
        params.set('category', location.state.searchCategory);
      }
      
      const searchUrl = params.toString() ? `/search?${params.toString()}` : '/search';
      navigate(searchUrl);
    } else {
      // Go back to homepage
      navigate('/');
    }
  };

  const plainAnswer = faq.answer.replace(/[#*`]/g, '');
  const description = plainAnswer.slice(0, 155).trim() + '…';
  const pageTitle = `${faq.question} | JomTesla`;
  const pageUrl = `https://jomtesla.my/faq/${faq.slug}`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: plainAnswer,
      },
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

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="hover:bg-accent hover:text-accent-foreground"
            onClick={handleBackNavigation}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* Admin Edit Button */}
          {user && faq && (
            <Link to={`/admin/faq/edit/${faq.slug}`}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit FAQ
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {faq.question}
              </h1>
            </div>
          </div>

          {/* Tags and Models */}
          <div className="ml-16 space-y-4">
            {/* Category */}
            {faq.category && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Category:</h3>
                <Badge variant="default" className="text-sm">
                  {faq.category}
                </Badge>
              </div>
            )}

            {/* Affected Models */}
            {faq.affected_models && faq.affected_models.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Applicable Models:</h3>
                <div className="flex flex-wrap gap-2">
                  {faq.affected_models.map((model) => (
                    <Badge 
                      key={model} 
                      variant="secondary"
                      className=""
                    >
                      <Car className="w-3 h-3 mr-1" />
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {faq.tags && faq.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {faq.tags.map((tag) => (
                    <Link 
                      key={tag} 
                      to={`/search?tag=${encodeURIComponent(tag)}`}
                      className="inline-block"
                    >
                      <Badge 
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Answer */}
        <Card className="bg-card border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="w-5 h-5 text-primary" />
              Detailed Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <p className="text-lg leading-relaxed mb-4">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({children}) => <em className="italic text-foreground">{children}</em>,
                  code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                  h1: ({children}) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-foreground mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold text-foreground mb-2">{children}</h3>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-foreground">{children}</li>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 mb-4">{children}</blockquote>,
                  a: ({href, children}) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline underline-offset-2 hover:underline-offset-4 transition-all duration-200"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {faq.answer}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        {faq.competitor_info && (
          <Card className="mt-8 bg-accent/20 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Car className="w-5 h-5" />
                Competitive Advantage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(faq.competitor_info).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <strong className="capitalize">{key.replace('_', ' ')}:</strong>
                  <span className="ml-2 text-foreground/90">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Was this helpful?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your feedback to help us improve this content for fellow Malaysians.
            </p>
            <FeedbackForm faqId={faq.id} />
          </div>
        </div>

        {/* Related FAQs */}
        {relatedFAQs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Related Questions</h3>
            <div className="space-y-3">
              {relatedFAQs.map((related) => (
                <Link
                  key={related.slug}
                  to={`/faq/${related.slug}`}
                  className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <p className="font-medium text-sm leading-snug">{related.question}</p>
                  {related.category && (
                    <span className="text-xs text-muted-foreground mt-1 inline-block">{related.category}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/search">
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
              >
                Search More Questions
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}