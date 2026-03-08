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
          id: d.id,
          site_name: d.site_name || defaults.site_name,
          site_tagline: d.site_tagline || defaults.site_tagline,
          logo_url: d.logo_url,
          dark_logo_url: d.dark_logo_url,
          footer_description: d.footer_description,
          copyright_text: d.copyright_text,
          contact_email: d.contact_email,
          cta_form_email: d.cta_form_email,
          seo_title: d.seo_title,
          seo_description: d.seo_description,
          nav_links: d.nav_links as NavLink[],
          social_links: d.social_links as SocialLink[],
          favicon_url: d.favicon_url,
          title_format: d.title_format || defaults.title_format,
          page_titles: d.page_titles || {},
          updated_at: d.updated_at,
        });
      }
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
}
