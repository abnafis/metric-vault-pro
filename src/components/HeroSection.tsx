import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Globe, ShieldCheck, TrendingUp, MousePointer, ShoppingCart, Users } from "lucide-react";
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

const nodeFallbackIcon = (style?: string) => {
  if (style === "green") return ShieldCheck;
  return Globe;
};

const trackedIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("purchase")) return ShoppingCart;
  if (l.includes("lead")) return Users;
  if (l.includes("cart")) return MousePointer;
  if (l.includes("quality")) return TrendingUp;
  return Check;
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
      {/* Floating glass orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-radial-glow pointer-events-none" />
      <div
        aria-hidden
        className="absolute top-24 right-[10%] w-64 h-64 rounded-full blur-[100px] opacity-40 animate-pulse-glow pointer-events-none"
        style={{ background: "hsl(var(--glow-blue-hsl))" }}
      />
      <div
        aria-hidden
        className="absolute bottom-12 left-[5%] w-48 h-48 rounded-full blur-[80px] opacity-30 animate-float pointer-events-none"
        style={{ background: "hsl(var(--glow-green-hsl))" }}
      />

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
                className="pill-cta pill-cta-glow"
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
                className="btn-glass gap-2"
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
            className="flow-panel-glass relative"
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[72px] opacity-40 pointer-events-none"
              style={{ background: "hsl(var(--glow-blue-hsl))" }}
            />

            <div className="flex items-center gap-2 mb-5 relative">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--brand-blue))]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {hero.flow_title}
              </span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-5 relative">
              <div>
                {hero.flow_nodes.map((n, i) => {
                  const FallbackIcon = nodeFallbackIcon(n.style);
                  return (
                    <div key={`${n.label}-${i}`}>
                      <div
                        className={`flow-node ${
                          n.style === "green"
                            ? "border-[hsl(var(--accent-green))] bg-[hsl(var(--accent-soft-green))]"
                            : "glass-strong"
                        }`}
                      >
                        {n.mark ? (
                          <Mark color={n.color || "#4285F4"}>{n.mark}</Mark>
                        ) : (
                          <FallbackIcon className={`h-4 w-4 ${n.style === "green" ? "text-[hsl(var(--accent-green))]" : "text-muted-foreground"}" />
                        )}
                        {n.label}
                      </div>
                      <Arrow />
                    </div>
                  );
                })}
                <div className="grid grid-cols-2 gap-3">
                  {hero.flow_destinations.map((d, i) => (
                    <div
                      key={`${d.label}-${i}`}
                      className={`flow-node text-xs sm:text-sm glass ${d.sub ? "flex-col items-start" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        {d.mark && <Mark color={d.color || "#4285F4"}>{d.mark}</Mark>}
                        {d.label}
                      </span>
                      {d.sub && (
                        <span className="text-[11px] text-[hsl(var(--accent-green))] pl-7">{d.sub}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 glass p-4 space-y-4 sm:w-[190px]">
                {hero.tracked_items.map((t, i) => {
                  const Icon = trackedIcon(t.label);
                  return (
                    <div key={`${t.label}-${i}`} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent-green))] text-white">
                        <Icon className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold text-foreground leading-tight">{t.label}</span>
                        <span className="block text-[11px] text-muted-foreground">{t.sub}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground relative">
              {hero.flow_footer.map((f, i) => (
                <span key={i}>{f}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
