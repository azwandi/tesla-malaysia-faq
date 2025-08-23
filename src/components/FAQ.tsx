import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Zap } from "lucide-react";
import { fetchFAQs, type FAQ } from "@/data/faqs";
import { useState, useEffect } from "react";

interface FAQListProps {
  faqs?: FAQ[];
  showViewAll?: boolean;
  fromSearch?: boolean; // Add this prop
  searchQuery?: string; // Add this prop
}

export const FAQList = ({ 
  faqs: faqList, 
  showViewAll = true, 
  fromSearch = false, 
  searchQuery = "" 
}: FAQListProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (faqList) {
      setFaqs(faqList);
      setLoading(false);
    } else {
      const loadFAQs = async () => {
        const data = await fetchFAQs();
        setFaqs(data);
        setLoading(false);
      };
      loadFAQs();
    }
  }, [faqList]);

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
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to the most common questions about owning a Tesla in Malaysia
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFaqs.map((faq) => (
            <Card 
              key={faq.id} 
              className="group hover:shadow-md transition-all cursor-pointer bg-card border-border"
            >
              <Link 
                to={`/faq/${faq.slug}`}
                state={fromSearch ? { 
                  fromSearch: true, 
                  searchQuery: searchQuery 
                } : undefined}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {faq.question}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-3">
                        {faq.answer.substring(0, 150)}...
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {faq.tags && faq.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Read More Button */}
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    {faq.competitor_info && (
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                      >
                        Comparison
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
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