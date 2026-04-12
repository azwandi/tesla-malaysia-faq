import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { fetchFAQs, fetchFAQsCount, type FAQ } from "@/data/faqs";
import { useState, useEffect } from "react";
import { stripMarkdown } from "@/lib/utils";

interface FAQListProps {
  faqs?: FAQ[];
  showViewAll?: boolean;
  fromSearch?: boolean;
  searchQuery?: string;
  searchTag?: string;
  searchCategory?: string;
  fetchFunction?: () => Promise<FAQ[]>;
}

export const FAQList = ({
  faqs: faqList,
  showViewAll = true,
  fromSearch = false,
  searchQuery = "",
  searchTag = "",
  searchCategory = "",
  fetchFunction = fetchFAQs
}: FAQListProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFAQsCount, setTotalFAQsCount] = useState<number>(0);

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

    if (showViewAll) {
      const loadTotalCount = async () => {
        const count = await fetchFAQsCount();
        setTotalFAQsCount(count);
      };
      loadTotalCount();
    }
  }, [faqList, fetchFunction, showViewAll]);

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          {showViewAll && (
            <div className="mb-12">
              <h2 className="font-sans text-5xl font-semibold tracking-tight mb-3">Frequently Asked Questions</h2>
              <div className="h-px w-16 bg-primary mb-6" />
            </div>
          )}
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="py-5 border-b border-border animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3.5 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayFaqs = showViewAll ? faqs.slice(0, 9) : faqs;

  const staggerClass = (i: number) => {
    const n = Math.min(i + 1, 10);
    return `animate-fade-up stagger-${n}`;
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        {showViewAll && (
          <div className="mb-12">
            <h2 className="font-sans text-5xl font-semibold tracking-tight mb-3">Frequently Asked Questions</h2>
            <div className="h-px w-16 bg-primary mb-2" />
            <p className="text-muted-foreground mt-4">
              The most common questions about owning a Tesla in Malaysia — answered.
            </p>
          </div>
        )}

        <div>
          {displayFaqs.map((faq, index) => (
            <Link
              key={faq.id}
              to={`/faq/${faq.slug}`}
              state={fromSearch ? {
                fromSearch: true,
                searchQuery,
                searchTag,
                searchCategory
              } : undefined}
              className={`faq-list-item group flex items-start gap-5 pl-4 hover:bg-accent/40 -mx-4 px-4 ${staggerClass(index)}`}
            >
              {/* Number */}
              <span className="font-sans text-3xl font-semibold text-muted-foreground/25 leading-none mt-0.5 min-w-[2rem] select-none group-hover:text-primary/30 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg leading-snug mb-1.5 group-hover:text-primary transition-colors">
                  {faq.question}
                </p>
                <p className="text-base text-muted-foreground line-clamp-1 leading-relaxed">
                  {stripMarkdown(faq.answer, 110)}
                </p>
              </div>

              {/* Meta + Arrow */}
              <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                {faq.category && (
                  <span className="hidden sm:inline text-xs font-medium text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {faq.category}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        {showViewAll && faqs.length > 6 && (
          <div className="mt-10 pt-4">
            <Link
              to="/search"
              className="group inline-flex items-center gap-2 text-base font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span>Browse all {totalFAQsCount} questions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
