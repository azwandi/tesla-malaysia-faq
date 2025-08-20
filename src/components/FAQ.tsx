import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Zap } from "lucide-react";
import { faqs, type FAQ } from "@/data/faqs";

interface FAQListProps {
  faqs?: FAQ[];
  showViewAll?: boolean;
}

export const FAQList = ({ faqs: faqList = faqs, showViewAll = true }: FAQListProps) => {
  const displayFaqs = showViewAll ? faqList.slice(0, 6) : faqList;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-tesla-light-gray/20">
      <div className="max-w-7xl mx-auto px-6">
        {showViewAll && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to the most common questions about owning a Tesla in Malaysia
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFaqs.map((faq) => (
            <Card 
              key={faq.id} 
              className="group hover:shadow-tesla transition-tesla cursor-pointer bg-card-tesla/50 backdrop-blur-sm border-border/50"
            >
              <Link to={`/faq/${faq.slug}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <Zap className="w-6 h-6 text-tesla-red mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-tesla-red transition-tesla">
                        {faq.question}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-3">
                        {faq.answer.substring(0, 150)}...
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Affected Models */}
                  {faq.affectedModels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {faq.affectedModels.slice(0, 3).map((model) => (
                        <Badge 
                          key={model} 
                          variant="secondary" 
                          className="text-xs bg-tesla-red/10 text-tesla-red border-tesla-red/20"
                        >
                          <Car className="w-3 h-3 mr-1" />
                          {model}
                        </Badge>
                      ))}
                      {faq.affectedModels.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{faq.affectedModels.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {faq.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs border-border/40 hover:border-tesla-red/40 hover:text-tesla-red transition-tesla"
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
                      className="text-tesla-red hover:text-tesla-red-dark hover:bg-tesla-red/5 p-0"
                    >
                      Read full answer
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    {faq.competitorInfo && (
                      <Badge 
                        variant="secondary"
                        className="text-xs bg-tesla-red/5 text-tesla-red border-tesla-red/20"
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
          {showViewAll && faqList.length > 6 && (
            <Card className="group hover:shadow-tesla-red transition-tesla cursor-pointer gradient-tesla-red text-white">
              <Link to="/search">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                      <ArrowRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">View All Questions</h3>
                    <p className="text-white/80 text-sm">
                      Explore our complete FAQ database with advanced search
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {faqList.length} questions
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