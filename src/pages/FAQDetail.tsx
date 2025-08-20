import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Car, Tag, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFAQBySlug } from "@/data/faqs";

export default function FAQDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  const faq = getFAQBySlug(slug);

  if (!faq) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-tesla-light-gray/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-tesla-red/5 hover:text-tesla-red">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to FAQ Hub
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full gradient-tesla-red flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {faq.question}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {faq.affectedModels.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    <span>Applicable to: {faq.affectedModels.join(", ")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{faq.tags.length} topics covered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags and Models */}
          <div className="space-y-4">
            {/* Affected Models */}
            {faq.affectedModels.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Applicable Models:</h3>
                <div className="flex flex-wrap gap-2">
                  {faq.affectedModels.map((model) => (
                    <Badge 
                      key={model} 
                      variant="secondary"
                      className="bg-tesla-red/10 text-tesla-red border-tesla-red/20"
                    >
                      <Car className="w-3 h-3 mr-1" />
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Topics:</h3>
              <div className="flex flex-wrap gap-2">
                {faq.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="border-border/40 hover:border-tesla-red/40 hover:text-tesla-red transition-tesla"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Answer */}
        <Card className="bg-card-tesla/30 backdrop-blur-sm border-border/50 shadow-tesla">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-tesla-red" />
              Detailed Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        {faq.competitorInfo && (
          <Card className="mt-8 bg-gradient-to-r from-tesla-red/5 to-tesla-red/10 border-tesla-red/20 shadow-tesla-red">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-tesla-red">
                <Car className="w-5 h-5" />
                {faq.competitorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-relaxed">
                {faq.competitorInfo.content}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border/50">
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
                className="w-full sm:w-auto bg-tesla-red hover:bg-tesla-red-dark"
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