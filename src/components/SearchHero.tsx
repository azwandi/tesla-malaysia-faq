import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { popularSearchTerms } from "@/data/faqs";
import { REFERRAL_URL, REFERRAL_DISCOUNT } from "@/lib/referral";
import teslaMalaysiaHero from '@/assets/tesla-malaysia-hero.jpg';

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
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image — light overlay so the image breathes */}
      <div className="absolute inset-0">
        <img
          src={teslaMalaysiaHero}
          alt="Tesla Model Y with Petronas Twin Towers in Kuala Lumpur"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
      </div>

      {/* Glass content card */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-10 sm:py-14 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 px-6 sm:px-10 py-10">

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-3">
            Buying a Tesla?
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Answers curated for Malaysians, by Malaysians 🇲🇾
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder={popularSearchTerms[placeholderIndex]}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-14 pr-32 py-8 text-lg bg-white border-gray-200 focus-visible:ring-2 rounded-xl transition-opacity duration-300 ${placeholderVisible ? 'placeholder:opacity-100' : 'placeholder:opacity-0'}`}
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-6 rounded-lg text-base"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Popular searches */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearchTerms.map(term => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Referral nudge */}
          <a
            href={REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Already decided? Get <strong>{REFERRAL_DISCOUNT} off</strong> with my referral link
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>

        </div>
      </div>
    </section>
  );
};