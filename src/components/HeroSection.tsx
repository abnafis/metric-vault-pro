import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { trackCTAClick } from "@/lib/dataLayer";

interface HeroData {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  badge_text: string;
  hero_image_url: string | null;
  status_label: string;
  status_value: string;
  since_label: string;
  since_value: string;
  projects_label: string;
  projects_value: string;
}

const fallback: HeroData = {
  headline: "Accurate Data. Better Marketing Decisions.",
  subheadline:
    "Expert GA4, Google Tag Manager, Server-Side Tracking, Meta CAPI & Conversion Tracking implementation — so every click, conversion and dollar is measured correctly.",
  primary_cta_text: "Get Tracking Audit",
  primary_cta_link: "#cta",
  secondary_cta_text: "View Case Studies",
  secondary_cta_link: "#cases",
  badge_text: "Available for new projects",
  hero_image_url: null,
  status_label: "Currently",
  status_value: "Analytics Engineer",
  since_label: "Since",
  since_value: "2019",
  projects_label: "Projects",
  projects_value: "100+",
};

const HeroSection = () => {
  const [hero, setHero] = useState<HeroData>(fallback);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("hero_content")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setHero({ ...fallback, ...(data as any) });
      });
    supabase
      .from("about_content")
      .select("profile_image_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && (data as any).profile_image_url) {
          setProfileImageUrl((data as any).profile_image_url);
        }
      });
  }, []);

  // Split headline: first sentence in normal weight, rest in serif italic
  const headlineParts = hero.headline.includes(".")
    ? [hero.headline.split(".")[0] + ".", hero.headline.split(".").slice(1).join(".").trim()]
    : [hero.headline, ""];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-noise"
    >
      {/* Subtle grid + radial */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-radial-glow pointer-events-none" />

      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Big typography */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="pill-eyebrow">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {hero.badge_text}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
              {headlineParts[0]}
              {headlineParts[1] && (
                <>
                  <br />
                  <span className="font-serif-display font-normal text-primary">
                    {headlineParts[1]}
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {hero.subheadline}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={hero.primary_cta_link}
                onClick={() => trackCTAClick("hero_get_tracking_audit")}
                className="btn-primary-glow group"
              >
                {hero.primary_cta_text}
                <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={hero.secondary_cta_link}
                onClick={() => trackCTAClick("hero_view_case_studies")}
                className="btn-secondary-glass"
              >
                {hero.secondary_cta_text}
              </a>
            </div>
          </motion.div>

          {/* Right: Refined portrait card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative max-w-sm mx-auto lg:ml-auto lg:mr-0">
              {/* Portrait card */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-card">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={hero.status_value}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
                    <span className="font-serif-display text-7xl text-primary">A</span>
                  </div>
                )}

                {/* Bottom gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/90 to-transparent" />

                {/* Status row pinned bottom */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {hero.status_label}
                    </p>
                    <p className="text-sm font-medium text-foreground">{hero.status_value}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>

              {/* Floating year/location card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-8 -left-4 sm:-left-10 glass-card px-4 py-3 rounded-xl z-10 bg-background/95"
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {hero.since_label}
                </p>
                <p className="font-serif-display text-2xl text-foreground leading-none">{hero.since_value}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute -top-4 -right-4 sm:-right-6 glass-card px-4 py-3 rounded-xl"
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {hero.projects_label}
                </p>
                <p className="font-serif-display text-2xl text-primary leading-none">{hero.projects_value}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="hidden lg:flex items-center gap-2 mt-20 text-xs font-mono uppercase tracking-widest text-muted-foreground"
        >
          <ArrowDown className="w-3 h-3 animate-bounce" />
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
