import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, CreditCard, Settings, Shield, Smartphone, HeadphonesIcon, FileText, Code } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: User,
    title: "Account & Profile",
    description: "Account setup, profile management, and user settings",
    articleCount: "45 articles",
    tag: "Popular",
    slug: "account"
  },
  {
    icon: CreditCard,
    title: "Billing & Payments", 
    description: "Payment methods, billing cycles, and subscription management",
    articleCount: "38 articles",
    tag: "Popular",
    slug: "billing"
  },
  {
    icon: Settings,
    title: "Getting Started",
    description: "Setup guides, tutorials, and first-time user help", 
    articleCount: "52 articles",
    slug: "getting-started"
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Data protection, two-factor auth, and privacy settings",
    articleCount: "29 articles",
    slug: "security"
  },
  {
    icon: Code,
    title: "API & Integrations",
    description: "Developer resources, API documentation, and webhooks",
    articleCount: "67 articles", 
    tag: "New",
    slug: "api"
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Mobile app features, troubleshooting, and updates",
    articleCount: "31 articles",
    slug: "mobile"
  },
  {
    icon: HeadphonesIcon,
    title: "Support & Contact", 
    description: "How to get help, contact options, and response times",
    articleCount: "18 articles",
    slug: "support"
  },
  {
    icon: FileText,
    title: "Policies & Legal",
    description: "Terms of service, privacy policy, and legal information",
    articleCount: "22 articles", 
    slug: "legal"
  }
];

export const BrowseByCategory = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers organized by topic. Each category contains detailed FAQs to help you quickly locate the information you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.slug} className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer">
                <Link to={`/search?tag=${category.slug}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      {category.tag && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          category.tag === 'Popular' 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {category.tag}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{category.articleCount}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/search">
              View All Categories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};