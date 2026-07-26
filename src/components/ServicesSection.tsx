import { motion } from "framer-motion";
import {
  ArrowUpRight, Check,
  Settings, Tag, Target, Server, Plug, Bug, BarChart3, Code, Database,
  Globe, Shield, Zap, Search, Layout, Monitor, Smartphone,
  Facebook, Linkedin, LineChart, Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSectionHeader } from "@/hooks/useSectionHeader";

const iconMap: Record<string, React.ComponentType<any>> = {
  Settings, Tag, Target, Server, Plug, Bug, BarChart3, Code, Database,
  Globe, Shield, Zap, Search, Layout, Monitor, Smartphone,
  Facebook, Linkedin, LineChart, Upload,
};

const accentMap: Record<string, { chip: string; ring: string; blob: string }> = {
  amber:  { chip: "bg-[#FEF3C7] text-[#B45309]", ring: "group-hover:ring-[#F59E0B]/40", blob: "bg-[#FEF3C7]" },
  blue:   { chip: "bg-[#DBEAFE] text-[#1D4ED8]", ring: "group-hover:ring-[#3B82F6]/40", blob: "bg-[#DBEAFE]" },
  pink:   { chip: "bg-[#FCE7F3] text-[#BE185D]", ring: "group-hover:ring-[#EC4899]/40", blob: "bg-[#FCE7F3]" },
  green:  { chip: "bg-[#DCFCE7] text-[#15803D]", ring: "group-hover:ring-[#22C55E]/40", blob: "bg-[#DCFCE7]" },
  purple: { chip: "bg-[#EDE9FE] text-[#6D28D9]", ring: "group-hover:ring-[#8B5CF6]/40", blob: "bg-[#EDE9FE]" },
  orange: { chip: "bg-[#FFEDD5] text-[#C2410C]", ring: "group-hover:ring-[#F97316]/40", blob: "bg-[#FFEDD5]" },
  teal:   { chip: "bg-[#CCFBF1] text-[#0F766E]", ring: "group-hover:ring-[#14B8A6]/40", blob: "bg-[#CCFBF1]" },
  slate:  { chip: "bg-[#E2E8F0] text-[#334155]", ring: "group-hover:ring-[#64748B]/40", blob: "bg-[#E2E8F0]" },
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  eyebrow: string | null;
  badge: string | null;
  accent: string;
  cta_label: string;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const header = useSectionHeader("services", {
    eyebrow: "— What I do",
    title: "Tracking that actually tracks.",
    subtitle:
      "Five focused services — from pixel installs to server-side offline conversions — built to give your ad platforms the clean data they need to spend smarter.",
  });

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setServices(data as unknown as Service[]);
      });
  }, []);

  // Split title on the last word so the last word is italic-muted
  const renderTitle = () => {
    const t = header.title || "";
    const parts = t.trim().split(" ");
    if (parts.length < 2) return t;
    const last = parts.pop();
    return (
      <>
        {parts.join(" ")}{" "}
        <span className="italic text-muted-foreground">{last}</span>
      </>
    );
  };

  return (
    <section id="services" className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          {header.eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4"
            >
              {header.eyebrow}
            </motion.p>
          )}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[0.95]"
          >
            {renderTitle()}
          </motion.h2>
          {header.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl"
            >
              {header.subtitle}
            </motion.p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Settings;
            const accent = accentMap[s.accent] || accentMap.amber;
            return (
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
                            hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)] ${accent.ring}`}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 ${accent.blob}`}
                />

                <div className="relative flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accent.chip}
                                transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.2} />
                  </div>
                  {s.badge && (
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                      {s.badge}
                    </span>
                  )}
                </div>

                {s.eyebrow && (
                  <p className="relative text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    {s.eyebrow}
                  </p>
                )}

                <h3 className="relative font-display text-2xl md:text-[26px] font-medium text-foreground leading-tight mb-3">
                  {s.title}
                </h3>

                <p className="relative text-sm text-muted-foreground leading-relaxed mb-6">
                  {s.description}
                </p>

                {s.features && s.features.length > 0 && (
                  <ul className="relative space-y-2.5 mb-8 mt-auto">
                    {s.features.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${accent.chip}`}>
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href="#contact"
                  className="relative inline-flex items-center gap-1.5 text-sm font-medium text-foreground group/link mt-auto"
                >
                  <span className="border-b border-foreground/30 group-hover/link:border-foreground transition-colors">
                    {s.cta_label || "Book this service"}
                  </span>
                  <ArrowUpRight
                    className={`w-4 h-4 transition-transform duration-300 ${
                      hovered === s.id ? "translate-x-0.5 -translate-y-0.5" : ""
                    }`}
                  />
                </a>
              </motion.div>
            );
          })}

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
