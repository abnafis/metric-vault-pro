import { BarChart3 } from "lucide-react";

const footerLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Case Studies", href: "#cases" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#cta" },
];

const socialLinks = [
  { label: "LinkedIn", href: "#" },
  { label: "X / Twitter", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "YouTube", href: "#" },
];

const Footer = () => (
  <footer className="border-t border-border/50 py-12">
    <div className="section-container">
      <div className="grid sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <a href="#" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <BarChart3 className="w-5 h-5 text-glow-blue" />
            TrackRight
          </a>
          <p className="text-sm text-muted-foreground">
            Web Analytics & Conversion Tracking Specialist
          </p>
          <p className="text-xs text-muted-foreground">
            contact@trackright.io
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Navigation</h4>
          <div className="space-y-2">
            {footerLinks.map((l) => (
              <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Social</h4>
          <div className="space-y-2">
            {socialLinks.map((l) => (
              <a key={l.label} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 mt-8 pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TrackRight. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
