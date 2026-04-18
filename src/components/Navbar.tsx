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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="h-7 max-w-[120px] object-contain"
              loading="eager"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary" />
          )}
          <span className="font-mono text-sm font-medium text-foreground tracking-tight">
            {settings.site_name}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
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
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#cta"
            onClick={(e) => {
              e.preventDefault();
              trackCTAClick("nav_get_audit");
              handleNavClick("#cta");
            }}
            className="ml-3 btn-primary-glow !px-5 !py-2 !text-xs"
          >
            Get Audit
          </a>
        </div>

        <button
          className="md:hidden text-foreground p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="section-container py-6 flex flex-col gap-1">
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
                  className="text-base text-muted-foreground hover:text-foreground py-3 border-b border-border/50"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#cta"
                onClick={(e) => {
                  e.preventDefault();
                  trackCTAClick("mobile_nav_get_audit");
                  handleNavClick("#cta");
                }}
                className="btn-primary-glow text-center mt-4"
              >
                Get Audit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
