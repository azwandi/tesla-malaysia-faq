import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Zap } from "lucide-react";
import { fetchFAQs, type FAQ } from "@/data/faqs";
import { useState, useEffect } from "react";
import { stripMarkdown } from "@/lib/utils";

interface FAQListProps {
  faqs?: FAQ[];
  showViewAll?: boolean;
  fromSearch?: boolean;
  searchQuery?: string;
  fetchFunction?: () => Promise<FAQ[]>;
}

export const FAQList = ({ 
  faqs: faqList, 
  showViewAll = true, 
  fromSearch = false, 
  searchQuery = "",
  fetchFunction = fetchFAQs
}: FAQListProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faqList) {
      setFaqs(faqList);
      setLoading(false);
    } else {
      const loadFAQs = async () => {
        const data = await fetchFunction();
        setFaqs(data);
        setLoading(false);
      };
      loadFAQs();
    }
  }, [faqList, fetchFunction]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="animate-pulse text-muted-foreground">Loading FAQs...</div>
          </div>
        </div>
      </section>
    );
  }

  const displayFaqs = showViewAll ? faqs.slice(0, 9) : faqs;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {showViewAll && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to the most common questions about owning a Tesla in Malaysia
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFaqs.map((faq) => (
            <Link 
              key={faq.id}
              to={`/faq/${faq.slug}`}
              state={fromSearch ? { 
                fromSearch: true, 
                searchQuery: searchQuery 
              } : undefined}
              className="block"
            >
              <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer bg-card border-border h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {faq.tags && faq.tags[0] && (
                      <Badge 
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {faq.tags[0]}
                      </Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                      <span>Popular</span>
                    </div>
                    {faq.created_at && (
                      <span>{new Date(faq.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* View All Questions Card */}
          {showViewAll && faqs.length > 6 && (
            <Card className="group hover:shadow-md transition-all cursor-pointer bg-primary text-primary-foreground">
              <Link to="/search">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-4">
                      <ArrowRight className="w-8 h-8 text-primary-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">View All Questions</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      Explore our complete FAQ database with advanced search
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    {faqs.length} questions
                  </Badge>
                </CardContent>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};