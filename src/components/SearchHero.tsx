import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { popularSearchTerms } from "@/data/faqs";
import { REFERRAL_URL, REFERRAL_DISCOUNT } from "@/lib/referral";
import { trackEvent } from "@/lib/analytics";

export const SearchHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex(i => (i + 1) % popularSearchTerms.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <section className="relative min-h-[80vh] sm:min-h-[68vh] flex items-center justify-center overflow-hidden bg-[#0b0b0c]">
      {/* Red glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-[55%] h-[70%] rounded-full bg-primary/20 blur-[130px]" />
        <div className="absolute top-0 right-0 w-[35%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center animate-fade-up">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/60 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          <Zap className="w-3 h-3 text-primary" />
          Tesla Malaysia FAQ
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-[3.75rem] font-bold text-white leading-[1.08] tracking-tight mb-5">
          Everything about buying<br />
          a Tesla in{" "}
          <span className="text-primary">Malaysia.</span>
        </h1>

        <p className="text-white/45 text-base sm:text-lg mb-10 font-normal">
          Community answers for Malaysian Tesla owners and buyers 🇲🇾
        </p>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="relative shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder={popularSearchTerms[placeholderIndex]}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`pl-12 pr-28 h-14 text-base bg-white border-0 rounded-xl focus-visible:ring-2 focus-visible:ring-primary transition-opacity duration-300 ${placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-0"}`}
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 px-5 rounded-lg font-semibold"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Popular chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {popularSearchTerms.map(term => (
            <button
              key={term}
              onClick={() => handleSearch(term)}
              className="text-sm px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/65 hover:text-white border border-white/10 font-medium transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Referral nudge */}
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("referral_clicked", { placement: "hero" })}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors"
        >
          Already decided? Get <span className="text-primary font-semibold">{REFERRAL_DISCOUNT} off</span> with my referral link
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
};
