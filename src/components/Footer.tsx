import { ExternalLink, Zap } from "lucide-react";
import { REFERRAL_URL, REFERRAL_DISCOUNT } from "@/lib/referral";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-8">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-sans text-xl font-semibold">JomTesla</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Answers curated for Malaysians, by a Malaysian Tesla owner. 🇲🇾
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Browse</p>
              <div className="space-y-2">
                <Link to="/search" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">All Questions</Link>
                <Link to="/search?category=Charging%20%26%20Battery" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Charging & Battery</Link>
                <Link to="/search?category=Buying%20%26%20Ownership" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Buying & Ownership</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support</p>
              <a
                href={REFERRAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("referral_clicked", { placement: "footer" })}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Get {REFERRAL_DISCOUNT} off with referral
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-xs text-muted-foreground mt-1.5">Helps keep this site free.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Not affiliated with Tesla, Inc. Information is community-sourced.</p>
          <p className="text-xs text-muted-foreground">Made with ♥ in Malaysia</p>
        </div>
      </div>
    </footer>
  );
};
