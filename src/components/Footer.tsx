import { ExternalLink } from "lucide-react";
import { REFERRAL_URL, REFERRAL_DISCOUNT } from "@/lib/referral";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Made for 🇲🇾 Malaysians. Support this site — order your Tesla with my referral link and get <span className="font-medium text-foreground">{REFERRAL_DISCOUNT} off</span>.
          </p>
          <a
            href={REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Use referral <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
