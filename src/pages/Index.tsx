import { SearchHero } from "@/components/SearchHero";
import { FAQList } from "@/components/FAQ";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SearchHero />
      <FAQList />
      
    </div>
  );
};

export default Index;
