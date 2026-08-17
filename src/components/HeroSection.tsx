import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Globe, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackCTAClick } from "@/lib/dataLayer";

interface Chip { name: string; color: string; mark: string; }
interface Tracked { label: string; sub: string; }
interface FlowNode { label: string; mark?: string; color?: string; style?: string; }
interface FlowDest { label: string; mark?: string; color?: string; sub?: string; }

interface HeroData {
  headline: string;
  subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text?: string | null;
  secondary_cta_link?: string | null;
  badge_text: string;
  social_proof_label: string;
  social_proof_avatars: string[];
  platform_chips: Chip[];
  tracked_items: Tracked[];
  flow_title: string;
  flow_nodes: FlowNode[];
  flow_destinations: FlowDest[];
  flow_footer: string[];
}

const fallback: HeroData = {
  headline: "Fix Your Tracking.\nGet Better Ad Data.\nMake Better Decisions.",
  subheadline:
    "I help businesses send accurate conversion data back to Google & Meta using GA4, GTM, Enhanced Conversions and Server-Side Tracking — so every click, conversion and dollar is measured correctly.",
  primary_cta_text: "Get Free Tracking Audit",
  primary_cta_link: "#cta",
  secondary_cta_text: "View Case Studies",
  secondary_cta_link: "#case-studies",
  badge_text: "Trusted by 200+ businesses worldwide",
  social_proof_label: "250+ Happy clients",
  social_proof_avatars: [],
  platform_chips: [
    { name: "Google Ads", color: "#4285F4", mark: "A" },
    { name: "Meta Ads", color: "#0866FF", mark: "M" },
    { name: "Google Analytics 4", color: "#F9AB00", mark: "G" },
    { name: "Shopify", color: "#95BF47", mark: "S" },
    { name: "HubSpot", color: "#FF7A59", mark: "H" },
  ],
  tracked_items: [
    { label: "Purchase", sub: "Tracked" },
    { label: "Lead", sub: "Tracked" },
    { label: "Add to Cart", sub: "Tracked" },
    { label: "Enhanced Conversions", sub: "Active" },
    { label: "Event Match Quality", sub: "8.7 / 10" },
  ],
  flow_title: "Accurate Data Flow",
  flow_nodes: [
    { label: "Your Website", style: "plain" },
    { label: "Google Tag Manager", mark: "T", color: "#4285F4", style: "plain" },
    { label: "Server Container", style: "green" },
  ],
  flow_destinations: [
    { label: "Analytics 4", mark: "G", color: "#F9AB00" },
    { label: "Meta CAPI", mark: "M", color: "#0866FF" },
    { label: "Google Ads", mark: "A", color: "#4285F4", sub: "Conversions" },
    { label: "Meta Ads", mark: "M", color: "#0866FF", sub: "Conversions" },
  ],
  flow_footer: ["Deduplicated Events", "More Accurate Data", "Better Ad Optimization"],
};

const asArray = <T,>(v: unknown, fb: T[]): T[] =>
  Array.isArray(v) && v.length > 0 ? (v as T[]) : fb;


const Arrow = () => (
  <div className="flex justify-center py-1.5" aria-hidden>
    <svg width="12" height="22" viewBox="0 0 12 22" fill="none">
      <path
        d="M6 0v18M1 14l5 6 5-6"
        stroke="hsl(220 12% 65%)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Mark = ({ color, children }: { color: string; children: string }) => (
  <span
    className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
    style={{ background: color }}
  >
    {children}
  </span>
);

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
            platform_chips: asArray<Chip>(d.platform_chips, fallback.platform_chips),
            tracked_items: asArray<Tracked>(d.tracked_items, fallback.tracked_items),
            flow_title: d.flow_title || fallback.flow_title,
            flow_nodes: asArray<FlowNode>(d.flow_nodes, fallback.flow_nodes),
            flow_destinations: asArray<FlowDest>(d.flow_destinations, fallback.flow_destinations),
            flow_footer: asArray<string>(d.flow_footer, fallback.flow_footer),
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

  const lines = (hero.headline || "")
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const secondaryText = hero.secondary_cta_text || fallback.secondary_cta_text!;
  const secondaryLink = hero.secondary_cta_link || fallback.secondary_cta_link!;

  return (
    <section id="home" className="relative overflow-hidden pt-14 sm:pt-20 pb-14">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-radial-glow pointer-events-none" />

      <div className="section-container relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            <div className="pill-eyebrow pill-eyebrow-green">{hero.badge_text}</div>

            <h1 className="text-[2.6rem] sm:text-5xl lg:text-[3.6rem] font-display leading-[1.05] tracking-tight text-foreground">
              {lines.map((l, i) => (
                <span key={i} className={`block ${i === 1 ? "text-brand-blue" : ""}`}>
                  {l}
                </span>
              ))}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {hero.subheadline}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {hero.platform_chips.map((p) => (
                <span key={p.name} className="platform-chip">
                  <Mark color={p.color}>{p.mark}</Mark>
                  {p.name}
                </span>
              ))}
              <span className="platform-chip text-muted-foreground">+ More</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={hero.primary_cta_link}
                onClick={() => trackCTAClick("hero_primary")}
                className="pill-cta"
              >
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className="pill-cta-avatar" />
                ) : (
                  <div className="pill-cta-avatar bg-muted" />
                )}
                <span>{hero.primary_cta_text}</span>
              </a>
              <a
                href={secondaryLink}
                onClick={() => trackCTAClick("hero_secondary")}
                className="btn-secondary-glass gap-2"
              >
                {secondaryText}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* Right: data flow diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flow-panel"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--brand-blue))]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Accurate Data Flow
              </span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-5">
              <div>
                <div className="flow-node">
                  <Globe className="h-4 w-4 text-muted-foreground" /> Your Website
                </div>
                <Arrow />
                <div className="flow-node">
                  <Mark color="#4285F4">T</Mark> Google Tag Manager
                </div>
                <Arrow />
                <div className="flow-node border-[hsl(var(--accent-green))] bg-[hsl(var(--accent-soft-green))]">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--accent-green))]" /> Server Container
                </div>
                <Arrow />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flow-node text-xs sm:text-sm">
                    <Mark color="#F9AB00">G</Mark> Analytics 4
                  </div>
                  <div className="flow-node text-xs sm:text-sm">
                    <Mark color="#0866FF">M</Mark> Meta CAPI
                  </div>
                  <div className="flow-node flex-col items-start text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Mark color="#4285F4">A</Mark> Google Ads
                    </span>
                    <span className="text-[11px] text-[hsl(var(--accent-green))] pl-7">Conversions</span>
                  </div>
                  <div className="flow-node flex-col items-start text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Mark color="#0866FF">M</Mark> Meta Ads
                    </span>
                    <span className="text-[11px] text-[hsl(var(--accent-green))] pl-7">Conversions</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 space-y-4 sm:w-[190px]">
                {trackedItems.map((t) => (
                  <div key={t.label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent-green))] text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-foreground leading-tight">{t.label}</span>
                      <span className="block text-[11px] text-muted-foreground">{t.sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
              <span>Deduplicated Events</span>
              <span>More Accurate Data</span>
              <span>Better Ad Optimization</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
