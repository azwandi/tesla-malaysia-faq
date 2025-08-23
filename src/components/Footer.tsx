import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">Built with love for fellow Malaysians</span>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-foreground leading-relaxed mb-6">
              This site is built with love to guide fellow Malaysians on their Tesla journey. 
              If my work has helped you, please support me by purchasing through my referral link. 
              You'll enjoy <strong>RM1,000 off</strong> your Tesla, and I'll be able to keep sharing more tips.
            </p>
            
            <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90">
              <a 
                href="https://www.tesla.com/referral/azwandi121931" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Get RM1,000 Off Your Tesla
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};