import { BarChart3 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  const visibleSocial = settings.social_links.filter((l) => l.visible);
  const year = new Date().getFullYear();
  const copyright = settings.copyright_text.replace("{year}", String(year));

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="section-container">
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-2 font-bold text-lg text-foreground">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-7 max-w-[120px] object-contain" />
              ) : (
                <BarChart3 className="w-5 h-5 text-glow-blue" />
              )}
              {settings.site_name}
            </a>
            <p className="text-sm text-muted-foreground">{settings.footer_description}</p>
            <p className="text-xs text-muted-foreground">{settings.contact_email}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Navigation</h4>
            <div className="space-y-2">
              {settings.nav_links.filter(l => l.visible !== false).map((l) => (
                <a key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {visibleSocial.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Social</h4>
              <div className="space-y-2">
                {visibleSocial.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
