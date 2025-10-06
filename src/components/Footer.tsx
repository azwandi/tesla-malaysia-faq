import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 text-muted-foreground">
            <span className="text-xs leading-relaxed">Hi! I share these Tesla tips to help 🇲🇾 Malaysians make the most of their EV journey. If you find them useful, consider using my referral link when you order your Tesla. You'll get RM1,000 off — and you'll help me keep this site running. Thank you! 🙏</span>
          </div>
          
          <div className="flex-shrink-0">
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
              <a 
                href="https://www.tesla.com/en_my/referral/azwandi121931" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <span>Get RM1,000 Off</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
