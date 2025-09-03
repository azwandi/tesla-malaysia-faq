import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, AlertCircle, Tag, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FAQList } from "@/components/FAQ";
import { searchFAQs, searchFAQsByTag, searchFAQsByCategory, fetchAllTags, faqCategories, FAQ } from "@/data/faqs";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag") || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category") || null);
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
      const category = searchParams.get("category") || "";
      
      setSearchQuery(query);
      setSelectedTag(tag || null);
      setSelectedCategory(category || null);
      
      let data: FAQ[] = [];
      if (category) {
        data = await searchFAQsByCategory(category);
      } else if (tag) {
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

  const handleCategoryClick = (category: string) => {
    setSearchParams({ category });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const currentQuery = searchParams.get("q") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentCategory = searchParams.get("category") || "";

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

      <div className="flex max-w-7xl mx-auto">
        {/* Side Panel */}
        <div className="w-80 bg-card/50 backdrop-blur-sm border-r border-border/50 p-6 sticky top-16 h-fit">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Search Tesla FAQ</h1>
            <p className="text-muted-foreground text-sm">
              Find answers to all your Tesla Malaysia questions
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for Tesla information..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 bg-background"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Clear Filters */}
          {(selectedCategory || selectedTag) && (
            <div className="mb-6">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Categories Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Folder className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Categories</h3>
            </div>
            <div className="space-y-2">
              {faqCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1 px-3 w-full justify-start block text-left"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1 px-2"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Results Header */}
          <div className="mb-8">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : currentCategory ? (
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentCategory}
                </h2>
                <p className="text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            ) : currentTag ? (
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  FAQs tagged with "{currentTag}"
                </h2>
                <p className="text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            ) : currentQuery ? (
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Search Results for "{currentQuery}"
                </h2>
                <p className="text-muted-foreground">
                  Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            ) : (
              <div>
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
                  searchQuery={currentQuery || currentTag || currentCategory}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">No Results Found</h3>
                    <p className="text-muted-foreground mb-8 text-lg">
                      {currentCategory 
                        ? `No FAQs found in the "${currentCategory}" category. Try selecting a different category or browse all questions.`
                        : currentTag 
                        ? `No FAQs found with the tag "${currentTag}". Try selecting a different tag or browse all questions.`
                        : `We couldn't find any questions matching "${currentQuery}". Try different keywords or browse all questions.`
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                      <Button 
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedTag(null);
                          setSelectedCategory(null);
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
      </div>
    </div>
  );
}