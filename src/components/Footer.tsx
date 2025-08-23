import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs hidden sm:inline">Hi! I share these Tesla tips to help 🇲🇾 Malaysians make the most of their EV journey. If you find them useful, consider using my referral link when you order your Tesla. You’ll get RM1,000 off — and you’ll help me keep this site running. Thank you!</span>
          </div>
          
          <div className="flex items-center gap-4">
            
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 shrink-0">
              <a 
                href="https://www.tesla.com/referral/azwandi121931" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <span className="hidden sm:inline">Get RM1,000 Off</span>
                <span className="sm:hidden">Tesla Deal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
