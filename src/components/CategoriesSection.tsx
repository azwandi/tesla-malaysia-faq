import { useState, useEffect } from "react";
import { ArrowRight, Car, Zap, Wrench, Shield, Sparkles, Settings, DollarSign } from "lucide-react";
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
  "Buying & Ownership": "Purchase process, financing, and getting started",
  "Charging & Battery": "Charging options, costs, range, and network",
  "Driving & Features": "Autopilot, driving modes, and software updates",
  "Maintenance & Service": "Service schedules, warranty, and troubleshooting",
  "Safety & Security": "Safety ratings, security systems, and emergency procedures",
  "Models & Variants": "Model comparisons, specs, and configurations",
  "Costs & Savings": "Running costs, tax incentives, and financial benefits",
  "Fun & Extras": "Customization, accessories, and unique Tesla experiences"
};

export const CategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryCounts = async () => {
      const counts: { [key: string]: number } = {};
      for (const category of faqCategories) {
        counts[category] = await fetchFAQsCountByCategory(category);
      }
      setCategoryCounts(counts);
      setLoading(false);
    };
    loadCategoryCounts();
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="mb-10 px-2">
          <h2 className="font-sans text-5xl font-semibold tracking-tight mb-3">Browse by Topic</h2>
          <div className="h-px w-16 bg-primary" />
        </div>

        {/* Numbered editorial grid */}
        <div className="category-grid grid-cols-2 md:grid-cols-4 rounded-sm overflow-hidden border border-border">
          {faqCategories.map((category, idx) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const count = categoryCounts[category] ?? 0;
            const desc = categoryDescriptions[category as keyof typeof categoryDescriptions];

            return (
              <Link
                key={category}
                to={`/search?category=${encodeURIComponent(category)}`}
                className={`group bg-card hover:bg-primary/5 transition-colors duration-150 p-5 sm:p-6 flex flex-col gap-3 animate-fade-up stagger-${Math.min(idx + 1, 10)}`}
              >
                {/* Number + Icon row */}
                <div className="flex items-start justify-between">
                  <span className="font-sans text-4xl font-semibold text-muted-foreground/20 group-hover:text-primary/25 transition-colors leading-none select-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="p-2 rounded-md bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>

                {/* Category name */}
                <div>
                  <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors mb-1.5">
                    {category}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                </div>

                {/* Article count */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  {loading ? (
                    <div className="h-3.5 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {count} {count === 1 ? 'article' : 'articles'}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
