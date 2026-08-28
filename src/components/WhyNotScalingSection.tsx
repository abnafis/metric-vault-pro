import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, LineChart, Split, ServerOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSectionHeader } from "@/hooks/useSectionHeader";

interface Feature { id: string; label: string; visible: boolean; }

const accents = [
  { Icon: AlertTriangle, bg: "hsl(0 80% 96%)", fg: "hsl(0 70% 52%)" },
  { Icon: LineChart, bg: "hsl(30 95% 94%)", fg: "hsl(28 90% 48%)" },
  { Icon: Split, bg: "hsl(48 95% 92%)", fg: "hsl(42 90% 42%)" },
  { Icon: ServerOff, bg: "hsl(260 80% 96%)", fg: "hsl(260 70% 55%)" },
];

const splitLabel = (label: string) => {
  const parts = label.split(/\s+[—–:-]\s+/);
  return { title: parts[0], desc: parts.slice(1).join(" — ") };
};

const WhyNotScalingSection = () => {
  const [items, setItems] = useState<Feature[]>([]);
  const header = useSectionHeader("why_not_scaling", {
    eyebrow: null,
    title: "Your Ads Aren't the Problem.\nYour Data Might Be.",
    subtitle: "Most businesses lose conversions (and money) because of broken or incomplete tracking.",
  });

  useEffect(() => {
    supabase.from("why_features").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems((data as Feature[]).filter((f) => f.visible !== false));
    });
  }, []);

  if (!items.length) return null;

  const titleLines = (header.title || "").split("\n").filter(Boolean);

  return (
    <section className="py-12 sm:py-16">
      <div className="section-container">
        <div className="rounded-3xl border border-white/50 glass p-6 sm:p-10 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none"
            style={{ background: "hsl(var(--glow-blue-hsl))" }}
          />

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-10 items-center relative">
            <div>
              {header.eyebrow && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{header.eyebrow}</p>
              )}
              <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                {titleLines.map((l, i) => (
                  <span key={i} className={`block ${i === 1 ? "text-brand-blue" : ""}`}>
                    {l}
                  </span>
                ))}
              </h2>
              {header.subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-md leading-relaxed">
                  {header.subtitle}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {items.map((f, i) => {
                const a = accents[i % accents.length];
                const { title, desc } = splitLabel(f.label);
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-2xl border border-border/70 glass-strong p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-28px_hsl(220_40%_20%_/_0.5)]"
                  >
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                      style={{ background: a.bg, color: a.fg }}
                    >
                      <a.Icon className="h-4.5 w-4.5" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                    {desc && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyNotScalingSection;
