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
      
      {/* Admin Access Button */}
      <div className="fixed bottom-6 right-6">
        <Link to="/admin/login">
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur-sm">
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
