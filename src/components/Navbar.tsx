import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { trackNavigationClick, trackCTAClick } from "@/lib/dataLayer";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSiteSettings();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("about_content")
      .select("profile_image_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && (data as any).profile_image_url) setAvatarUrl((data as any).profile_image_url);
      });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visibleLinks = settings.nav_links.filter((l) => l.visible !== false);
  const whatsappUrl = (settings as any)?.whatsapp_url || "#cta";

  const handleNavClick = (href: string, label?: string) => {
    setOpen(false);
    if (label) trackNavigationClick(label);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-8 sm:top-10 left-0 right-0 z-50 transition-all duration-300 flex justify-center px-4`}
    >
      <div className={`pill-nav flex items-center gap-2 pl-2 pr-2 py-2 ${scrolled ? "shadow-lg" : ""}`}>
        <a
          href="/"
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-muted transition-colors shrink-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-foreground" />
          )}
          <span className="text-sm font-medium text-foreground tracking-tight hidden sm:inline">
            {settings.site_name}
          </span>
        </a>

        <div className="hidden md:flex items-center">
          {visibleLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (l.href.startsWith("#")) {
                  e.preventDefault();
                  handleNavClick(l.href, l.label);
                } else {
                  trackNavigationClick(l.label);
                }
              }}
              className="px-4 py-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 rounded-full"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={whatsappUrl}
          target={whatsappUrl.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          onClick={() => trackCTAClick("nav_whatsapp")}
          className="hidden sm:inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent-green))] animate-pulse" />
          WhatsApp
        </a>

        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full mt-3 left-4 right-4 rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="p-4 flex flex-col gap-1">
              {visibleLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    if (l.href.startsWith("#")) {
                      e.preventDefault();
                      handleNavClick(l.href, l.label);
                    } else {
                      trackNavigationClick(l.label);
                      setOpen(false);
                    }
                  }}
                  className="text-base text-foreground py-3 px-3 hover:bg-muted rounded-lg"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={whatsappUrl}
                target={whatsappUrl.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => {
                  trackCTAClick("mobile_nav_whatsapp");
                  setOpen(false);
                }}
                className="btn-primary-glow text-center mt-2"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
