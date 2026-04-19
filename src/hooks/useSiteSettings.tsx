import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NavLink {
  label: string;
  href: string;
  visible?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  visible: boolean;
}

export interface PageTitle {
  title: string;
  meta_title: string;
  meta_description: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  dark_logo_url: string | null;
  footer_description: string;
  copyright_text: string;
  contact_email: string;
  cta_form_email: string;
  seo_title: string;
  seo_description: string;
  nav_links: NavLink[];
  social_links: SocialLink[];
  favicon_url: string | null;
  title_format: string;
  page_titles: Record<string, PageTitle>;
  footer_eyebrow: string;
  footer_headline: string;
  footer_headline_highlight: string;
  footer_headline_suffix: string;
  footer_navigate_label: string;
  footer_elsewhere_label: string;
  updated_at: string;
}

const defaults: SiteSettings = {
  id: "",
  site_name: "TrackRight",
  site_tagline: "Web Analytics & Conversion Tracking Specialist",
  logo_url: null,
  dark_logo_url: null,
  footer_description: "Web Analytics & Conversion Tracking Specialist",
  copyright_text: "© {year} TrackRight. All rights reserved.",
  contact_email: "contact@trackright.io",
  cta_form_email: "contact@trackright.io",
  seo_title: "TrackRight — Web Analytics & Conversion Tracking",
  seo_description: "Expert GA4, GTM, Server-Side Tracking & Conversion implementation for data-driven businesses.",
  nav_links: [
    { label: "Services", href: "#services", visible: true },
    { label: "Process", href: "#process", visible: true },
    { label: "Case Studies", href: "#cases", visible: true },
    { label: "About", href: "#about", visible: true },
    { label: "Contact", href: "#cta", visible: true },
  ],
  social_links: [
    { label: "LinkedIn", href: "#", visible: true },
    { label: "X / Twitter", href: "#", visible: true },
    { label: "GitHub", href: "#", visible: true },
    { label: "YouTube", href: "#", visible: true },
  ],
  favicon_url: null,
  title_format: "{page} | {site}",
  page_titles: {},
  footer_eyebrow: "— Get in touch",
  footer_headline: "Let's build",
  footer_headline_highlight: "accurate",
  footer_headline_suffix: "data together.",
  footer_navigate_label: "Navigate",
  footer_elsewhere_label: "Elsewhere",
  updated_at: "",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("*")
        .limit(1)
        .single();
      if (data) {
        const d = data as any;
        setSettings({
          ...defaults,
          ...d,
          site_name: d.site_name || defaults.site_name,
          site_tagline: d.site_tagline || defaults.site_tagline,
          nav_links: (d.nav_links as NavLink[]) || defaults.nav_links,
          social_links: (d.social_links as SocialLink[]) || defaults.social_links,
          title_format: d.title_format || defaults.title_format,
          page_titles: d.page_titles || {},
          footer_eyebrow: d.footer_eyebrow || defaults.footer_eyebrow,
          footer_headline: d.footer_headline || defaults.footer_headline,
          footer_headline_highlight: d.footer_headline_highlight || defaults.footer_headline_highlight,
          footer_headline_suffix: d.footer_headline_suffix || defaults.footer_headline_suffix,
          footer_navigate_label: d.footer_navigate_label || defaults.footer_navigate_label,
          footer_elsewhere_label: d.footer_elsewhere_label || defaults.footer_elsewhere_label,
        });
      }
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
}
