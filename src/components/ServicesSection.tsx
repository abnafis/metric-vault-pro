import { motion } from "framer-motion";
import {
  ArrowUpRight, Check, Star,
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

type AccentKey = "amber" | "blue" | "pink" | "green" | "purple" | "orange" | "teal" | "slate";

const accentMap: Record<AccentKey, { bg: string; fg: string; btn: string }> = {
  amber:  { bg: "var(--service-amber-bg)", fg: "var(--service-amber-fg)", btn: "var(--service-amber-btn)" },
  blue:   { bg: "var(--service-blue-bg)", fg: "var(--service-blue-fg)", btn: "var(--service-blue-btn)" },
  pink:   { bg: "var(--service-pink-bg)", fg: "var(--service-pink-fg)", btn: "var(--service-pink-btn)" },
  green:  { bg: "var(--service-green-bg)", fg: "var(--service-green-fg)", btn: "var(--service-green-btn)" },
  purple: { bg: "var(--service-purple-bg)", fg: "var(--service-purple-fg)", btn: "var(--service-purple-btn)" },
  orange: { bg: "var(--service-orange-bg)", fg: "var(--service-orange-fg)", btn: "var(--service-orange-btn)" },
  teal:   { bg: "var(--service-teal-bg)", fg: "var(--service-teal-fg)", btn: "var(--service-teal-btn)" },
  slate:  { bg: "var(--service-slate-bg)", fg: "var(--service-slate-fg)", btn: "var(--service-slate-btn)" },
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
  cta_link: string;
  cta_style: string;
  icon_image_url: string | null;
  card_bg_preset: string;
  card_bg_color: string | null;
  card_bg_image_url: string | null;
  price_label: string | null;
  featured: boolean;
}

interface ServicesCTA {
  eyebrow: string;
  headline: string;
  headline_highlight: string;
  button_label: string;
  button_link: string;
}

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cta, setCta] = useState<ServicesCTA | null>(null);
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
    supabase
      .from("services_cta")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCta(data as unknown as ServicesCTA);
      });
  }, []);

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

  const getCardStyle = (s: Service): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (s.card_bg_preset === "custom" && s.card_bg_color) {
      style.backgroundColor = `${s.card_bg_color}99`;
    }
    if (s.card_bg_image_url) {
      style.backgroundImage = `linear-gradient(hsl(var(--background) / 0.35), hsl(var(--background) / 0.35)), url(${s.card_bg_image_url})`;
      style.backgroundSize = "cover";
      style.backgroundPosition = "center";
    }
    return style;
  };

  const getCardClass = (s: Service) => {
    switch (s.card_bg_preset) {
      case "tint":
        return "bg-secondary/80";
      case "dark":
        return "glass-dark text-white";
      case "custom":
        return "glass";
      default:
        return "glass";
    }
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
            const accent = accentMap[(s.accent as AccentKey) || "amber"] || accentMap.amber;
            const isDark = s.card_bg_preset === "dark";
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                style={getCardStyle(s)}
                className={`group relative overflow-hidden rounded-3xl border border-white/50 p-7 flex flex-col
                            ring-1 ring-transparent transition-all duration-500
                            hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]
                            ${getCardClass(s)}
                            ${s.featured ? "glass-card-glow ring-2 ring-primary/40" : "border-border"}`}
              >
                {s.featured && (
                  <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-current" /> Popular
                  </span>
                )}

                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ background: `hsl(${accent.bg})` }}
                />

                <div className="relative flex items-start justify-between mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                    style={{ background: `hsl(${accent.bg})`, color: `hsl(${accent.fg})` }}
                  >
                    {s.icon_image_url ? (
                      <img src={s.icon_image_url} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <Icon className="w-6 h-6" strokeWidth={2.2} />
                    )}
                  </div>
                  {s.badge && !s.featured && (
                    <span className={`text-[10px] font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${isDark ? "bg-white/15 text-white/90" : "bg-secondary/80 text-muted-foreground"}`}>
                      {s.badge}
                    </span>
                  )}
                </div>

                {s.eyebrow && (
                  <p className={`relative text-[11px] uppercase tracking-[0.18em] mb-3 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
                    {s.eyebrow}
                  </p>
                )}

                <h3 className={`relative font-display text-2xl md:text-[26px] font-medium leading-tight mb-3 ${isDark ? "text-white" : "text-foreground"}`}>
                  {s.title}
                </h3>

                <p className={`relative text-sm leading-relaxed mb-4 ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
                  {s.description}
                </p>

                {s.price_label && (
                  <p className={`relative text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-foreground"}`}>
                    {s.price_label}
                  </p>
                )}

                {s.features && s.features.length > 0 && (
                  <ul className="relative space-y-2.5 mb-8 mt-auto">
                    {s.features.map((b) => (
                      <li key={b} className={`flex items-start gap-2.5 text-sm ${isDark ? "text-white/80" : "text-foreground/80"}`}>
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `hsl(${accent.bg})`, color: `hsl(${accent.fg})` }}
                        >
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {s.cta_style === "button" ? (
                  <a
                    href={s.cta_link || "#contact"}
                    className="relative inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-full transition-all mt-auto w-fit text-white hover:-translate-y-0.5"
                    style={{ background: `hsl(${accent.btn})` }}
                  >
                    {s.cta_label || "Book this service"}
                    <ArrowUpRight className={`w-4 h-4 transition-transform duration-300 ${hovered === s.id ? "translate-x-0.5 -translate-y-0.5" : ""}`} />
                  </a>
                ) : (
                  <a
                    href={s.cta_link || "#contact"}
                    className={`relative inline-flex items-center gap-1.5 text-sm font-medium group/link mt-auto w-fit ${isDark ? "text-white" : "text-foreground"}`}
                  >
                    <span className={`border-b transition-colors ${isDark ? "border-white/30 group-hover/link:border-white" : "border-foreground/30 group-hover/link:border-foreground"}`}>
                      {s.cta_label || "Book this service"}
                    </span>
                    <ArrowUpRight
                      className={`w-4 h-4 transition-transform duration-300 ${
                        hovered === s.id ? "translate-x-0.5 -translate-y-0.5" : ""
                      }`}
                    />
                  </a>
                )}
              </motion.div>
            );
          })}

          {/* CTA card */}
          {cta && (
            <motion.a
              href={cta.button_link || "#contact"}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: services.length * 0.06 }}
              className="group relative overflow-hidden rounded-3xl glass-dark text-white p-7 flex flex-col justify-between min-h-[320px]
                         hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-32 -left-16 w-72 h-72 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                style={{ background: `hsl(var(--glow-yellow-hsl))` }}
              />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 mb-3">
                  {cta.eyebrow}
                </p>
                <h3 className="font-display text-3xl md:text-4xl font-medium leading-tight">
                  {cta.headline}{" "}
                  <span className="italic" style={{ color: "hsl(var(--glow-yellow-hsl))" }}>{cta.headline_highlight}</span>
                </h3>
              </div>
              <div className="relative flex items-center justify-between mt-6">
                <span className="text-sm text-white/70">{cta.button_label}</span>
                <span className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
