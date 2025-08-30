import { SearchHero } from "@/components/SearchHero";
import { FAQList } from "@/components/FAQ";
import { CategoriesSection } from "@/components/CategoriesSection";
import { fetchFeaturedFAQs } from "@/data/faqs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SearchHero />
      <CategoriesSection />
      <FAQList fetchFunction={fetchFeaturedFAQs} />
      
    </div>
  );
};

export default Index;
