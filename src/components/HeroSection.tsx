import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackCTAClick } from "@/lib/dataLayer";

interface HeroData {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  badge_text: string;
  social_proof_label: string;
  social_proof_avatars: string[];
}

const fallback: HeroData = {
  headline: "Same ad spend\nTrack 60% more Conversion",
  subheadline: "I make sure your ads get the complete data.",
  primary_cta_text: "Book a call with me",
  primary_cta_link: "#cta",
  badge_text: "Available for New Projects",
  social_proof_label: "250+ Happy clients",
  social_proof_avatars: [],
};

// Inline platform icons (SVG data URIs / simple emoji-ish blocks)
const platformTiles = [
  { name: "Shopify", bg: "#95BF47", label: "S" },
  { name: "TikTok", bg: "#000", label: "♪" },
  { name: "Google Ads", bg: "#fff", label: "G", color: "#4285F4" },
  { name: "Meta", bg: "#0866FF", label: "∞" },
  { name: "GA4", bg: "#F9AB00", label: "⌾" },
];

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
        if (data) {
          const d = data as any;
          setHero({
            ...fallback,
            ...d,
            social_proof_avatars: Array.isArray(d.social_proof_avatars) ? d.social_proof_avatars : [],
          });
        }
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

  const [line1, line2] = hero.headline.includes("\n")
    ? hero.headline.split("\n")
    : hero.headline.includes(".")
    ? [hero.headline.split(".")[0], hero.headline.split(".").slice(1).join(".").trim()]
    : [hero.headline, ""];

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center pt-32 sm:pt-36 pb-20 overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-radial-glow pointer-events-none" />

      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="pill-eyebrow pill-eyebrow-green">{hero.badge_text}</div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-display leading-[0.95] tracking-tight">
              <span className="text-muted-foreground">{line1}</span>
              {line2 && (
                <>
                  <br />
                  <span className="text-foreground">{line2}</span>
                </>
              )}
            </h1>

            <p className="text-lg sm:text-xl text-foreground font-semibold max-w-xl leading-snug">
              {hero.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={hero.primary_cta_link}
                onClick={() => trackCTAClick("hero_book_call")}
                className="pill-cta"
              >
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="pill-cta-avatar" />
                ) : (
                  <div className="pill-cta-avatar bg-muted" />
                )}
                <span>{hero.primary_cta_text}</span>
              </a>
            </div>
          </motion.div>

          {/* Right: floating dashboard cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative h-[400px] sm:h-[460px]"
          >
            {/* Back card */}
            <motion.div
              initial={{ rotate: 0, y: 20 }}
              animate={{ rotate: 6, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="dashboard-card absolute top-6 right-0 w-[85%] h-[280px] sm:h-[320px] p-6 opacity-70"
            >
              <div className="grid grid-cols-2 gap-3 h-full">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">Setup</div>
                  <div className="text-xs text-white/80 mt-1">Compliant</div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">Tags</div>
                  <div className="text-xs text-white/80 mt-1">Active</div>
                </div>
                <div className="rounded-lg bg-white/5 p-3 col-span-2">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">Privacy</div>
                  <div className="text-xs text-white/80 mt-1">Extends</div>
                </div>
              </div>
            </motion.div>

            {/* Front card */}
            <motion.div
              initial={{ rotate: 0, y: -10 }}
              animate={{ rotate: -3, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="dashboard-card absolute top-0 left-0 w-[90%] h-[300px] sm:h-[340px] p-6 flex flex-col justify-between"
            >
              <div className="relative flex-1 flex items-center justify-center">
                {/* Center portrait */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white/10 z-10 bg-white/5">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5" />
                  )}
                </div>

                {/* Floating platform tiles */}
                {platformTiles.map((t, i) => {
                  const angle = (i / platformTiles.length) * Math.PI * 2 - Math.PI / 2;
                  const r = 110;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r * 0.7;
                  return (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                      className="absolute w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                      style={{
                        background: t.bg,
                        color: t.color || (t.bg === "#fff" ? "#000" : "#fff"),
                        left: `calc(50% + ${x}px - 22px)`,
                        top: `calc(50% + ${y}px - 22px)`,
                      }}
                    >
                      {t.label}
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-[11px] uppercase tracking-widest text-white/50">
                  Tracking & Analytics Setup
                </div>
                <div className="text-xs text-white/70 mt-1 leading-relaxed">
                  Setup paid ads conversion tracking for 3x better results — Google Ads, Meta Pixel, GA4, and more.
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
