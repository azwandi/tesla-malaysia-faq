import { SearchHero } from "@/components/SearchHero";
import { FAQList } from "@/components/FAQ";
import { BrowseByCategory } from "@/components/BrowseByCategory";
import { StatsSection } from "@/components/StatsSection";
import { fetchFeaturedFAQs } from "@/data/faqs";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SearchHero />
      <FAQList fetchFunction={fetchFeaturedFAQs} />
      <BrowseByCategory />
      <StatsSection />
    </div>
  );
};

export default Index;
