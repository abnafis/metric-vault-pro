import { motion } from "framer-motion";
import { ArrowUpRight, Check, BarChart3, Facebook, Linkedin, LineChart, Upload } from "lucide-react";
import { useState } from "react";

interface Service {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: JSX.Element;
  accent: string; // tailwind bg for icon chip
  ring: string;   // tailwind ring color for hover
  badge: string;
}

const services: Service[] = [
  {
    id: "google-ads",
    eyebrow: "01 / Paid search",
    title: "Google Ads Conversion Tracking",
    description:
      "Accurate, deduplicated conversion signals so Google's algorithm optimises against real revenue — not noisy proxies.",
    bullets: [
      "eCommerce, sales funnels & service sites",
      "WordPress, Shopify, Lightspeed, GoHighLevel",
      "Enhanced Conversions + consent mode v2",
    ],
    icon: <BarChart3 className="w-6 h-6" strokeWidth={2.2} />,
    accent: "bg-[#FEF3C7] text-[#B45309]",
    ring: "group-hover:ring-[#F59E0B]/40",
    badge: "Most requested",
  },
  {
    id: "facebook-ads",
    eyebrow: "02 / Meta",
    title: "Facebook & Instagram Ads Tracking",
    description:
      "Server-side Meta Pixel + Conversions API so iOS restrictions and ad-blockers stop shredding your attribution.",
    bullets: [
      "Pixel + CAPI dual-tracking",
      "Event-match quality above 8.0",
      "Full funnel event mapping",
    ],
    icon: <Facebook className="w-6 h-6" strokeWidth={2.2} />,
    accent: "bg-[#DBEAFE] text-[#1D4ED8]",
    ring: "group-hover:ring-[#3B82F6]/40",
    badge: "iOS-proof",
  },
  {
    id: "multi-platform",
    eyebrow: "03 / Cross-channel",
    title: "LinkedIn, Pinterest & TikTok Ads Tracking",
    description:
      "One clean measurement layer for every ad platform you run — no duplicate scripts, no conflicting numbers.",
    bullets: [
      "LinkedIn Insight Tag + CAPI",
      "TikTok Events API",
      "Pinterest conversions API",
    ],
    icon: <Linkedin className="w-6 h-6" strokeWidth={2.2} />,
    accent: "bg-[#FCE7F3] text-[#BE185D]",
    ring: "group-hover:ring-[#EC4899]/40",
    badge: "3-in-1",
  },
  {
    id: "ga4",
    eyebrow: "04 / Analytics",
    title: "Google Analytics 4 Setup",
    description:
      "A GA4 build you can actually trust — clean events, cross-domain, e-commerce, and dashboards that answer real questions.",
    bullets: [
      "Custom event & parameter schema",
      "Cross-domain & sub-domain tracking",
      "Looker Studio dashboards included",
    ],
    icon: <LineChart className="w-6 h-6" strokeWidth={2.2} />,
    accent: "bg-[#DCFCE7] text-[#15803D]",
    ring: "group-hover:ring-[#22C55E]/40",
    badge: "Foundation",
  },
  {
    id: "offline",
    eyebrow: "05 / Advanced",
    title: "Google Ads Offline Conversion Tracking",
    description:
      "Feed real closed-deal revenue back to Google Ads so Smart Bidding stops chasing form-fills and starts chasing customers.",
    bullets: [
      "CRM → Google Ads integration",
      "GCLID capture & storage",
      "Automated Zapier / Make workflows",
    ],
    icon: <Upload className="w-6 h-6" strokeWidth={2.2} />,
    accent: "bg-[#EDE9FE] text-[#6D28D9]",
    ring: "group-hover:ring-[#8B5CF6]/40",
    badge: "Revenue-grade",
  },
];

const ServicesSection = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="services" className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
          >
            — What I do
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[0.95]"
          >
            Tracking that actually{" "}
            <span className="italic text-muted-foreground">tracks.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl"
          >
            Five focused services — from pixel installs to server-side offline conversions —
            built to give your ad platforms the clean data they need to spend smarter.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-3xl bg-card border border-border p-7 flex flex-col
                          ring-1 ring-transparent transition-all duration-500
                          hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] ${s.ring}
                          ${i === services.length - 1 && services.length % 3 === 2 ? "lg:col-span-1" : ""}
                          ${i === services.length - 1 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              {/* Ambient gradient blob */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 ${s.accent}`}
              />

              {/* Top row: icon + badge */}
              <div className="relative flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.accent}
                              transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  {s.icon}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                  {s.badge}
                </span>
              </div>

              {/* Eyebrow */}
              <p className="relative text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                {s.eyebrow}
              </p>

              {/* Title */}
              <h3 className="relative font-display text-2xl md:text-[26px] font-medium text-foreground leading-tight mb-3">
                {s.title}
              </h3>

              {/* Description */}
              <p className="relative text-sm text-muted-foreground leading-relaxed mb-6">
                {s.description}
              </p>

              {/* Bullets */}
              <ul className="relative space-y-2.5 mb-8 mt-auto">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${s.accent}`}
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* Footer link */}
              <a
                href="#contact"
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-foreground group/link"
              >
                <span className="border-b border-foreground/30 group-hover/link:border-foreground transition-colors">
                  Book this service
                </span>
                <ArrowUpRight
                  className={`w-4 h-4 transition-transform duration-300 ${
                    hovered === s.id ? "translate-x-0.5 -translate-y-0.5" : ""
                  }`}
                />
              </a>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: services.length * 0.06 }}
            className="group relative overflow-hidden rounded-3xl bg-[hsl(var(--surface-dark))] text-white p-7 flex flex-col justify-between min-h-[320px]
                       hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full blur-3xl bg-[hsl(var(--accent-yellow))] opacity-20 group-hover:opacity-40 transition-opacity duration-700"
            />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 mb-3">
                — Not sure what you need?
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-medium leading-tight">
                Let's diagnose your tracking in{" "}
                <span className="italic text-[hsl(var(--accent-yellow))]">15 minutes.</span>
              </h3>
            </div>
            <div className="relative flex items-center justify-between mt-6">
              <span className="text-sm text-white/70">Free audit call</span>
              <span className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
