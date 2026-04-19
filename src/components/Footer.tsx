import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Linkedin, Twitter, Github, Youtube, Globe, Facebook, Instagram, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
};

function getIcon(label: string) {
  const key = label.toLowerCase().replace(/[^a-z]/g, "");
  for (const [k, Icon] of Object.entries(iconMap)) {
    if (key.includes(k)) return Icon;
  }
  return Globe;
}

const Footer = () => {
  const { settings } = useSiteSettings();
  const visibleSocial = settings.social_links.filter((l) => l.visible && l.href !== "#");
  const visibleNav = settings.nav_links.filter((l) => l.visible !== false);
  const year = new Date().getFullYear();
  const copyright = settings.copyright_text.replace("{year}", String(year));

  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">
      {/* Massive brand wordmark */}
      <div className="section-container pt-20 pb-12">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 space-y-6">
            <p className="pill-eyebrow">{settings.footer_eyebrow}</p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              {settings.footer_headline}{" "}
              <span className="font-serif-display text-primary">{settings.footer_headline_highlight}</span>{" "}
              {settings.footer_headline_suffix}
            </h2>
            <a
              href={`mailto:${settings.contact_email}`}
              className="inline-flex items-center gap-2 text-base story-link"
            >
              {settings.contact_email}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {settings.footer_navigate_label}
            </p>
            <div className="flex flex-col gap-3">
              {visibleNav.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-foreground hover:text-primary transition-colors w-fit"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {settings.footer_elsewhere_label}
            </p>
            <div className="flex flex-col gap-3">
              {visibleSocial.map((l) => {
                const Icon = getIcon(l.label);
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors w-fit group"
                  >
                    <Icon className="w-4 h-4" />
                    {l.label}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Massive wordmark */}
        <div className="border-t border-border pt-8">
          <p
            className="font-serif-display text-foreground/[0.06] leading-none select-none whitespace-nowrap overflow-hidden"
            style={{ fontSize: "clamp(4rem, 18vw, 16rem)" }}
            aria-hidden="true"
          >
            {settings.site_name}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
          <p className="text-xs font-mono text-muted-foreground">{copyright}</p>
          <p className="text-xs font-mono text-muted-foreground">
            Crafted with precision · {year}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
