import { motion } from "framer-motion";

import googleAdsLogo from "@/assets/platforms/google-ads.png";
import metaAdsLogo from "@/assets/platforms/meta-ads.png";
import hubspotLogo from "@/assets/platforms/hubspot.png";
import gohighlevelLogo from "@/assets/platforms/gohighlevel.png";
import calendlyLogo from "@/assets/platforms/calendly.png";
import shopifyLogo from "@/assets/platforms/shopify.png";

const platforms = [
  { name: "Google Ads", logo: googleAdsLogo },
  { name: "Meta Ads", logo: metaAdsLogo },
  { name: "HubSpot", logo: hubspotLogo },
  { name: "GoHighLevel", logo: gohighlevelLogo },
  { name: "Calendly", logo: calendlyLogo },
  { name: "Shopify", logo: shopifyLogo },
];

const TrustedPlatformsSection = () => (
  <section className="py-20 relative">
    {/* Top gradient divider */}
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
        {platforms.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card-hover flex flex-col items-center justify-center gap-3 py-6 px-3 group cursor-default"
          >
            <div className="w-12 h-12 flex items-center justify-center opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
              <img
                src={p.logo}
                alt={p.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-300">
              {p.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Bottom gradient divider */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glow-purple/30 to-transparent" />
  </section>
);

export default TrustedPlatformsSection;
