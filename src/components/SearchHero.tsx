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

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-tesla-red rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Hero Title */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-tesla-red" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Tesla Malaysia
            </h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-tesla-light-gray mb-4">
            FAQ Hub
          </h2>
          <p className="text-lg md:text-xl text-tesla-light-gray/80 max-w-2xl mx-auto">
            Get instant answers to your Tesla questions. From charging costs to government incentives, we've got you covered.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tesla-gray" />
              <Input
                type="text"
                placeholder="Ask anything about Tesla in Malaysia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 py-6 text-lg bg-card-tesla/95 backdrop-blur-sm border-0 shadow-tesla-red focus-visible:ring-tesla-red focus-visible:ring-2"
              />
              <Button 
                type="submit"
                variant="default"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-tesla-red hover:bg-tesla-red-dark text-white px-6"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Popular Search Terms */}
        <div className="max-w-3xl mx-auto">
          <p className="text-tesla-light-gray/70 mb-4 text-sm">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularSearchTerms.map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(term)}
                className="border-tesla-light-gray/30 text-tesla-light-gray hover:bg-tesla-red/20 hover:border-tesla-red hover:text-white transition-tesla"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};