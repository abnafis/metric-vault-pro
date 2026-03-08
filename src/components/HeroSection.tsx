import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroDashboard from "./HeroDashboard";
import { BarChart3, Activity, Target, TrendingUp, Code2, Megaphone, LineChart } from "lucide-react";

interface HeroData {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  badge_text: string;
  hero_image_url: string | null;
}

const fallback: HeroData = {
  headline: "Accurate Data. Better Marketing Decisions.",
  subheadline: "Expert GA4, Google Tag Manager, Server-Side Tracking, Meta CAPI & Conversion Tracking implementation — so every click, conversion and dollar is measured correctly.",
  primary_cta_text: "Get Tracking Audit",
  primary_cta_link: "#cta",
  secondary_cta_text: "View Case Studies →",
  secondary_cta_link: "#cases",
  badge_text: "Trusted by 100+ businesses",
  hero_image_url: null,
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
        if (data) setHero(data as HeroData);
      });
    supabase
      .from("about_content")
      .select("profile_image_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && (data as any).profile_image_url) setProfileImageUrl((data as any).profile_image_url);
      });
  }, []);

  const headlineParts = hero.headline.includes(".")
    ? [hero.headline.split(".")[0] + ".", hero.headline.split(".").slice(1).join(".").trim()]
    : [hero.headline, ""];

  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={
        hero.hero_image_url
          ? { backgroundImage: `url(${hero.hero_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-glow pointer-events-none" />
      {hero.hero_image_url && <div className="absolute inset-0 bg-background/70" />}

      <div className="section-container relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 text-xs text-muted-foreground rounded-full">
            <span className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
            {hero.badge_text}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            {headlineParts[0]}{" "}
            {headlineParts[1] && <span className="gradient-text">{headlineParts[1]}</span>}
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            {hero.subheadline}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href={hero.primary_cta_link} className="btn-primary-glow text-sm">
              {hero.primary_cta_text}
            </a>
            <a href={hero.secondary_cta_link} className="btn-secondary-glass text-sm">
              {hero.secondary_cta_text}
            </a>
          </div>
        </motion.div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          {profileImageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative cursor-pointer"
            >
              <motion.div
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full glow-border overflow-hidden shadow-2xl"
                whileHover={{ boxShadow: "0 0 40px 10px hsl(var(--glow-blue) / 0.3)" }}
                transition={{ duration: 0.3 }}
              >
                <img src={profileImageUrl} alt="Portrait" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              </motion.div>
              <motion.div
                className="absolute -inset-4 rounded-full bg-[hsl(var(--glow-blue))]/10 blur-2xl -z-10"
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          ) : (
            <HeroDashboard />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
