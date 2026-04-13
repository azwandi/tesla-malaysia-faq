import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, AlertCircle, Tag, Folder, Car, Zap, Wrench, Shield, Sparkles, Settings, DollarSign, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FAQList } from "@/components/FAQ";
import { searchFAQs, searchFAQsByTag, searchFAQsByCategory, fetchAllTags, faqCategories, FAQ } from "@/data/faqs";
import { trackEvent } from "@/lib/analytics";

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

interface SidebarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  hasFilter: boolean;
  selectedCategory: string | null;
  selectedTag: string | null;
  tags: string[];
  onCategoryClick: (category: string) => void;
  onTagClick: (tag: string) => void;
  onClearFilters: () => void;
}

function Sidebar({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  hasFilter,
  selectedCategory,
  selectedTag,
  tags,
  onCategoryClick,
  onTagClick,
  onClearFilters,
}: SidebarProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <form onSubmit={onSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9 pr-20 bg-background text-sm"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs px-3">
            Go
          </Button>
        </div>
      </form>

      {/* Clear filters */}
      {hasFilter && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      )}

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Folder className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</h3>
        </div>
        <div className="space-y-0.5">
          {faqCategories.map((category) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategoryClick(category)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-base transition-colors text-left ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`text-sm px-2.5 py-1 rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag") || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category") || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetchAllTags().then(setTags);
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
      if (category) data = await searchFAQsByCategory(category);
      else if (tag) data = await searchFAQsByTag(tag);
      else data = await searchFAQs(query);

      setResults(data);
      if (query.trim()) {
        trackEvent("search_performed", {
          query_length: query.trim().length,
          result_count: data.length,
          zero_results: data.length === 0,
        });
      }
      setLoading(false);
    };
    loadResults();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setSearchParams({ q: searchQuery.trim() });
  };

  const handleTagClick = (tag: string) => {
    trackEvent("tag_clicked", { tag });
    setSearchParams({ tag });
    setSidebarOpen(false);
  };

  const handleCategoryClick = (category: string) => {
    trackEvent("category_clicked", { category });
    setSearchParams({ category });
    setSidebarOpen(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSidebarOpen(false);
  };

  const currentQuery = searchParams.get("q") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentCategory = searchParams.get("category") || "";
  const hasFilter = !!(currentCategory || currentTag);

  const sidebarProps: SidebarProps = {
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    onSearchSubmit: handleSearch,
    hasFilter,
    selectedCategory,
    selectedTag,
    tags,
    onCategoryClick: handleCategoryClick,
    onTagClick: handleTagClick,
    onClearFilters: clearFilters,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <span className="font-sans text-lg font-semibold hidden sm:block">JomTesla</span>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {hasFilter && <span className="w-2 h-2 rounded-full bg-primary" />}
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto w-72 bg-background h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Filter Questions</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <Sidebar {...sidebarProps} />
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-border sticky top-[53px] h-[calc(100vh-53px)] overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="font-sans text-2xl font-semibold mb-1">Search</h1>
            <p className="text-sm text-muted-foreground">Tesla Malaysia FAQ</p>
          </div>
          <Sidebar {...sidebarProps} />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          {/* Result header */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-muted-foreground text-sm">Searching…</span>
              </div>
            ) : currentCategory ? (
              <>
                <h2 className="font-sans text-3xl font-semibold mb-1">{currentCategory}</h2>
                <p className="text-sm text-muted-foreground">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
              </>
            ) : currentTag ? (
              <>
                <h2 className="font-sans text-3xl font-semibold mb-1">Tagged: {currentTag}</h2>
                <p className="text-sm text-muted-foreground">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
              </>
            ) : currentQuery ? (
              <>
                <h2 className="font-sans text-3xl font-semibold mb-1">
                  Results for <span className="italic">"{currentQuery}"</span>
                </h2>
                <p className="text-sm text-muted-foreground">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
              </>
            ) : (
              <>
                <h2 className="font-sans text-3xl font-semibold mb-1">All Questions</h2>
                <p className="text-sm text-muted-foreground">{results.length} questions</p>
              </>
            )}
          </div>

          {!loading && (
            results.length > 0 ? (
              <FAQList
                faqs={results}
                showViewAll={false}
                fromSearch={true}
                searchQuery={currentQuery}
                searchTag={currentTag}
                searchCategory={currentCategory}
              />
            ) : (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">No results found</h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
                  {currentCategory
                    ? `No FAQs in "${currentCategory}". Try a different category.`
                    : currentTag
                    ? `No FAQs tagged "${currentTag}".`
                    : `No matches for "${currentQuery}". Try different keywords.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    View All Questions
                  </Button>
                  <Link to="/">
                    <Button size="sm">Back to Home</Button>
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
