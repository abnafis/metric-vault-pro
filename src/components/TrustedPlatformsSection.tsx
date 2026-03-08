import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import googleAdsLogo from "@/assets/platforms/google-ads.png";
import metaAdsLogo from "@/assets/platforms/meta-ads.png";
import hubspotLogo from "@/assets/platforms/hubspot.png";
import gohighlevelLogo from "@/assets/platforms/gohighlevel.png";
import calendlyLogo from "@/assets/platforms/calendly.png";
import shopifyLogo from "@/assets/platforms/shopify.png";

interface Platform {
  name: string;
  logo_url: string;
  link: string | null;
}

const fallback: Platform[] = [
  { name: "Google Ads", logo_url: googleAdsLogo, link: null },
  { name: "Meta Ads", logo_url: metaAdsLogo, link: null },
  { name: "HubSpot", logo_url: hubspotLogo, link: null },
  { name: "GoHighLevel", logo_url: gohighlevelLogo, link: null },
  { name: "Calendly", logo_url: calendlyLogo, link: null },
  { name: "Shopify", logo_url: shopifyLogo, link: null },
];

const TrustedPlatformsSection = () => {
  const [platforms, setPlatforms] = useState<Platform[]>(fallback);

  useEffect(() => {
    supabase
      .from("platforms")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setPlatforms(data as Platform[]);
      });
  }, []);

  return (
    <section className="py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-blue/30 to-transparent" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm text-glow-blue uppercase tracking-widest mb-3 font-semibold">
            Trusted Platforms & Tools
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Industry-Leading <span className="gradient-text">Integrations</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Working with the tools businesses rely on for marketing, analytics, and CRM.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-5">
          {platforms.map((p, i) => {
            const inner = (
              <motion.div
                key={p.name + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card-hover flex flex-col items-center justify-center gap-3 py-6 px-3 group cursor-default"
              >
                <div className="w-12 h-12 flex items-center justify-center opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                  <img src={p.logo_url} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">
                  {p.name}
                </span>
              </motion.div>
            );

            return p.link ? (
              <a key={p.name + i} href={p.link} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <div key={p.name + i}>{inner}</div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-purple/30 to-transparent" />
    </section>
  );
};

export default TrustedPlatformsSection;
