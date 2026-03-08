import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  visible: boolean;
}

export interface SiteSettings {
  id: string;
  footer_description: string;
  copyright_text: string;
  contact_email: string;
  cta_form_email: string;
  seo_title: string;
  seo_description: string;
  nav_links: NavLink[];
  social_links: SocialLink[];
  favicon_url: string | null;
  updated_at: string;
}

const defaults: SiteSettings = {
  id: "",
  footer_description: "Web Analytics & Conversion Tracking Specialist",
  copyright_text: "© {year} TrackRight. All rights reserved.",
  contact_email: "contact@trackright.io",
  cta_form_email: "contact@trackright.io",
  seo_title: "TrackRight — Web Analytics & Conversion Tracking",
  seo_description: "Expert GA4, GTM, Server-Side Tracking & Conversion implementation for data-driven businesses.",
  nav_links: [
    { label: "Services", href: "#services" },
    { label: "Process", href: "#process" },
    { label: "Case Studies", href: "#cases" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#cta" },
  ],
  social_links: [
    { label: "LinkedIn", href: "#", visible: true },
    { label: "X / Twitter", href: "#", visible: true },
    { label: "GitHub", href: "#", visible: true },
    { label: "YouTube", href: "#", visible: true },
  ],
  favicon_url: null,
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
          footer_description: d.footer_description,
          copyright_text: d.copyright_text,
          contact_email: d.contact_email,
          cta_form_email: d.cta_form_email,
          seo_title: d.seo_title,
          seo_description: d.seo_description,
          nav_links: d.nav_links as NavLink[],
          social_links: d.social_links as SocialLink[],
          favicon_url: d.favicon_url,
          updated_at: d.updated_at,
        });
      }
      setLoading(false);
    })();
  }, []);

  return { settings, loading };
}
