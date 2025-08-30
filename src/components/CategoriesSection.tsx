import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Car, Zap, Wrench, Shield, Calculator, Sparkles, Settings, DollarSign } from "lucide-react";
import { faqCategories, fetchFAQsCountByCategory } from "@/data/faqs";
import { Link } from "react-router-dom";

const categoryIcons = {
  "Buying & Ownership": Car,
  "Charging & Battery": Zap,
  "Driving & Features": Settings,
  "Maintenance & Service": Wrench,
  "Safety & Security": Shield,
  "Models & Variants": Car,
  "Costs & Savings": DollarSign,
  "Fun & Extras": Sparkles
};

const categoryDescriptions = {
  "Buying & Ownership": "Purchase process, financing, ownership benefits, and getting started with your Tesla",
  "Charging & Battery": "Charging options, battery care, range optimization, and charging network information",
  "Driving & Features": "Autopilot, driving modes, entertainment features, and software updates",
  "Maintenance & Service": "Service schedules, maintenance tips, warranty information, and troubleshooting",
  "Safety & Security": "Safety features, security systems, emergency procedures, and protection measures",
  "Models & Variants": "Model comparisons, specifications, configurations, and feature differences",
  "Costs & Savings": "Running costs, tax benefits, insurance, and financial advantages of ownership",
  "Fun & Extras": "Customization options, accessories, entertainment features, and unique Tesla experiences"
};

const popularCategories = ["Charging & Battery", "Buying & Ownership", "Driving & Features"];

export const CategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryCounts = async () => {
      const counts: { [key: string]: number } = {};
      
      for (const category of faqCategories) {
        const count = await fetchFAQsCountByCategory(category);
        counts[category] = count;
      }
      
      setCategoryCounts(counts);
      setLoading(false);
    };

    loadCategoryCounts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers organized by topic. Each category contains detailed FAQs to help
              you quickly locate the information you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqCategories.map((category) => (
              <Card key={category} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-lg bg-muted w-12 h-12"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded"></div>
                    <div className="h-4 w-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers organized by topic. Each category contains detailed FAQs to help
            you quickly locate the information you need.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {faqCategories.map((category) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const isPopular = popularCategories.includes(category);
            
            return (
              <Link
                key={category}
                to={`/search?category=${encodeURIComponent(category)}`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-border/50 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {isPopular && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {categoryCounts[category] || 0} articles
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};