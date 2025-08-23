import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { popularSearchTerms } from "@/data/faqs";
export const SearchHero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };
  return <section className="relative min-h-[60vh] flex items-center justify-center bg-background overflow-hidden">
      {/* Background Pattern - Removed for accessibility */}
      <div className="absolute inset-0">
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Hero Title */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">Getting a Tesla in Malaysia?</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-muted-foreground mb-4">We can help with your questions</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant answers to your Tesla questions. From charging costs to government incentives, we've got you covered. Curated for 🇲🇾
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="text" placeholder="Ask anything about Tesla in Malaysia..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 pr-32 py-6 text-lg bg-card border border-border focus-visible:ring-ring focus-visible:ring-2" />
              <Button type="submit" variant="default" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Popular Search Terms */}
        <div className="max-w-3xl mx-auto">
          <p className="text-muted-foreground mb-4 text-sm">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearchTerms.map(term => <Button key={term} variant="outline" size="sm" onClick={() => handleSearch(term)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                {term}
              </Button>)}
          </div>
        </div>
      </div>
    </section>;
};
