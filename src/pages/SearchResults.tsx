import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FAQList } from "@/components/FAQ";
import { searchFAQs } from "@/data/faqs";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(searchFAQs(searchParams.get("q") || ""));

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    setResults(searchFAQs(query));
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const currentQuery = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-tesla-light-gray/10">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-tesla-red/5 hover:text-tesla-red">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Search Header */}
      <section className="bg-gradient-to-r from-primary/5 to-tesla-red/5 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Search Tesla FAQ
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to all your Tesla Malaysia questions
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tesla-gray" />
              <Input
                type="text"
                placeholder="Search for Tesla information..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-32 py-4 text-lg bg-card-tesla backdrop-blur-sm border-border/50 shadow-tesla focus-visible:ring-tesla-red focus-visible:ring-2"
              />
              <Button 
                type="submit"
                variant="default"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-tesla-red hover:bg-tesla-red-dark text-white px-6"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Results Header */}
          <div className="mb-8">
            {currentQuery ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Search Results for "{currentQuery}"
                </h2>
                <p className="text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">All FAQ Questions</h2>
                <p className="text-muted-foreground">
                  Browse all {results.length} frequently asked questions
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {results.length > 0 ? (
            <FAQList faqs={results} showViewAll={false} />
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-tesla-red/10 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-tesla-red" />
                </div>
                <h3 className="text-xl font-bold mb-4">No Results Found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any questions matching "{currentQuery}". 
                  Try different keywords or browse all questions.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({});
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    View All Questions
                  </Button>
                  <Link to="/">
                    <Button 
                      variant="default" 
                      className="w-full bg-tesla-red hover:bg-tesla-red-dark"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}