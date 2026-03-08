import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BarChart3 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();

  const visibleLinks = settings.nav_links.filter((l) => l.visible !== false);

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70">
      <div className="section-container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-foreground shrink-0">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="h-8 max-w-[140px] object-contain"
              loading="eager"
            />
          ) : (
            <BarChart3 className="w-6 h-6 text-glow-blue" />
          )}
          <span>{settings.site_name}</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {visibleLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (l.href.startsWith("#")) {
                  e.preventDefault();
                  handleNavClick(l.href);
                }
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a href="#cta" onClick={(e) => { e.preventDefault(); handleNavClick("#cta"); }} className="btn-primary-glow text-sm px-5 py-2">
            Get Audit
          </a>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="section-container py-4 flex flex-col gap-3">
              {visibleLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    if (l.href.startsWith("#")) {
                      e.preventDefault();
                      handleNavClick(l.href);
                    } else {
                      setOpen(false);
                    }
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground py-2"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#cta"
                onClick={(e) => { e.preventDefault(); handleNavClick("#cta"); }}
                className="btn-primary-glow text-sm px-5 py-2 text-center mt-2"
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
