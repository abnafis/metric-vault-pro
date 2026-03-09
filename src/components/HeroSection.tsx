import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroDashboard from "./HeroDashboard";
import { Star } from "lucide-react";
import { trackCTAClick } from "@/lib/dataLayer";

import googleAdsLogo from "@/assets/platforms/google-ads.png";
import metaAdsLogo from "@/assets/platforms/meta-ads.png";
import gtmLogo from "@/assets/platforms/gtm-official.svg";
import ga4Logo from "@/assets/platforms/ga4-official.svg";
import serverSideLogo from "@/assets/platforms/server-side.png";
import conversionsLogo from "@/assets/platforms/conversions.png";

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

const orbitItems = [
  { logo: googleAdsLogo, label: "Google Ads" },
  { logo: metaAdsLogo, label: "Meta Ads" },
  { logo: gtmLogo, label: "GTM" },
  { logo: ga4Logo, label: "GA4" },
  { logo: serverSideLogo, label: "Server-Side" },
  { logo: conversionsLogo, label: "Conversions" },
];

const HeroPortraitWithIcons = ({ profileImageUrl }: { profileImageUrl: string }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Orbiting platform logos */}
      {orbitItems.map((item, i) => {
        const angle = (360 / orbitItems.length) * i;
        const radius = 220;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return (
          <motion.div
            key={item.label}
            className="absolute left-1/2 top-1/2 z-20"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={
              hovered
                ? { opacity: 1, scale: 1, x: x - 22, y: y - 22 }
                : { opacity: 0, scale: 0, x: 0, y: 0 }
            }
            transition={{
              duration: 0.4,
              delay: hovered ? i * 0.06 : 0,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.div
              className="glass-card w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg p-2"
              animate={hovered ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            >
              <img src={item.logo} alt={item.label} className="w-full h-full object-contain" />
            </motion.div>
            <p className="text-[10px] text-muted-foreground text-center mt-1 font-medium whitespace-nowrap">
              {item.label}
            </p>
          </motion.div>
        );
      })}

      {/* Portrait */}
      <motion.div
        className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full glow-border overflow-hidden shadow-2xl relative z-10"
        whileHover={{ boxShadow: "0 0 40px 10px hsl(var(--glow-blue) / 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <img src={profileImageUrl} alt="Portrait" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
      </motion.div>

      {/* Background glow */}
      <motion.div
        className="absolute -inset-4 rounded-full bg-[hsl(var(--glow-blue))]/10 blur-2xl -z-10"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

interface ReviewSnippet {
  name: string;
  text: string;
  rating: number;
}

const fallbackReviews: ReviewSnippet[] = [
  { name: "Sarah M.", text: "Tracking accuracy improved by 40%", rating: 5 },
  { name: "David C.", text: "Finally, data we can trust", rating: 5 },
  { name: "Emily R.", text: "Best GA4 setup I've seen", rating: 5 },
  { name: "James C.", text: "ROI visible within weeks", rating: 5 },
  { name: "Olivia T.", text: "Server-side tracking game changer", rating: 5 },
  { name: "Michael B.", text: "Attribution issues solved overnight", rating: 5 },
];

const FloatingReviews = ({ reviews }: { reviews: ReviewSnippet[] }) => {
  // Position cards at fixed spots scattered across the background
  const positions = [
    { top: "8%", left: "5%", delay: 0 },
    { top: "65%", left: "2%", delay: 2.5 },
    { top: "30%", right: "3%", delay: 1.2 },
    { top: "75%", right: "5%", delay: 3.8 },
    { top: "15%", right: "15%", delay: 5 },
    { top: "85%", left: "12%", delay: 6.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {reviews.slice(0, positions.length).map((review, i) => {
        const pos = positions[i];
        return (
          <motion.div
            key={i}
            className="absolute max-w-[200px]"
            style={{ top: pos.top, left: pos.left, right: (pos as any).right }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.45, 0.45, 0],
              y: [20, 0, 0, -10],
            }}
            transition={{
              duration: 6,
              delay: pos.delay,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          >
            <div className="glass-card rounded-xl p-3 border border-border/30 bg-background/40 backdrop-blur-sm">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: review.rating }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 fill-[hsl(var(--chart-green))] text-[hsl(var(--chart-green))]" />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug italic">"{review.text}"</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">— {review.name}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const HeroSection = () => {
  const [hero, setHero] = useState<HeroData>(fallback);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewSnippet[]>(fallbackReviews);

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
    supabase
      .from("testimonials")
      .select("name, text, rating")
      .order("sort_order")
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setReviews(data.map((t) => ({ name: t.name.split(" ")[0] + " " + (t.name.split(" ")[1]?.[0] || "") + ".", text: t.text.length > 45 ? t.text.slice(0, 45) + "…" : t.text, rating: t.rating })));
        }
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
      {/* Floating review snippets */}
      <FloatingReviews reviews={reviews} />

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
            <a href={hero.primary_cta_link} onClick={() => trackCTAClick("hero_get_tracking_audit")} className="btn-primary-glow text-sm">
              {hero.primary_cta_text}
            </a>
            <a href={hero.secondary_cta_link} onClick={() => trackCTAClick("hero_view_case_studies")} className="btn-secondary-glass text-sm">
              {hero.secondary_cta_text}
            </a>
          </div>
        </motion.div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          {profileImageUrl ? (
            <HeroPortraitWithIcons profileImageUrl={profileImageUrl} />
          ) : (
            <HeroDashboard />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
