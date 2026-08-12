import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CalendarDays, BarChart3, Gauge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSectionHeader } from "@/hooks/useSectionHeader";

interface Metric {
  id: string;
  value: string;
  label: string;
}

const accents = [
  { Icon: Users, bg: "hsl(140 60% 93%)", fg: "hsl(150 60% 32%)" },
  { Icon: CalendarDays, bg: "hsl(215 90% 94%)", fg: "hsl(221 83% 53%)" },
  { Icon: BarChart3, bg: "hsl(30 95% 93%)", fg: "hsl(28 90% 48%)" },
  { Icon: Gauge, bg: "hsl(260 80% 95%)", fg: "hsl(260 70% 55%)" },
];

const MetricsStrip = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const header = useSectionHeader("metrics", { eyebrow: null, title: null, subtitle: null });

  useEffect(() => {
    supabase
      .from("hero_metrics" as any)
      .select("id,value,label")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: any) => {
        if (Array.isArray(data)) setMetrics(data);
      });
  }, []);

  if (!metrics.length) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="section-container">
        {(header.eyebrow || header.title || header.subtitle) && (
          <div className="text-center mb-8">
            {header.eyebrow && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{header.eyebrow}</p>
            )}
            {header.title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{header.title}</h2>
            )}
            {header.subtitle && <p className="text-muted-foreground mt-3">{header.subtitle}</p>}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card px-4 sm:px-8 py-7 shadow-[0_20px_50px_-40px_hsl(220_40%_20%_/_0.6)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {metrics.map((m, i) => {
              const a = accents[i % accents.length];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 px-2 sm:px-6 py-5 sm:py-2"
                >
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ background: a.bg, color: a.fg }}
                  >
                    <a.Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                      {m.value}
                    </span>
                    <span className="block text-sm text-muted-foreground mt-0.5">{m.label}</span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsStrip;
