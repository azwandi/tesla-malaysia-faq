import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FAQList } from "@/components/FAQ";
import { searchFAQs, searchFAQsByTag, fetchAllTags, FAQ } from "@/data/faqs";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag") || null);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadTags = async () => {
      const tagData = await fetchAllTags();
      setTags(tagData);
    };
    loadTags();
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      const query = searchParams.get("q") || "";
      const tag = searchParams.get("tag") || "";
      
      setSearchQuery(query);
      setSelectedTag(tag || null);
      
      let data: FAQ[] = [];
      if (tag) {
        data = await searchFAQsByTag(tag);
      } else {
        data = await searchFAQs(query);
      }
      
      setResults(data);
      setLoading(false);
    };
    loadResults();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchParams({ tag });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const currentQuery = searchParams.get("q") || "";
  const currentTag = searchParams.get("tag") || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-tesla-light-gray/10">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-accent hover:text-accent-foreground">
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
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground px-6"
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
          {/* Tag Filter Section */}
          {tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Filter by Topic</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTag && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="mb-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm py-1 px-3"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="mb-8">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : currentTag ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  FAQs tagged with "{currentTag}"
                </h2>
                <p className="text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            ) : currentQuery ? (
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
          {!loading && (
            <>
              {results.length > 0 ? (
                  <FAQList 
                    faqs={results} 
                    showViewAll={false} 
                    fromSearch={true}
                    searchQuery={currentQuery || currentTag}
                  />
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">No Results Found</h3>
                    <p className="text-muted-foreground mb-8 text-lg">
                      {currentTag 
                        ? `No FAQs found with the tag "${currentTag}". Try selecting a different tag or browse all questions.`
                        : `We couldn't find any questions matching "${currentQuery}". Try different keywords or browse all questions.`
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                      <Button 
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedTag(null);
                          setSearchParams({});
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        View All Questions
                      </Button>
                      <Link to="/">
                        <Button 
                          variant="secondary" 
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}