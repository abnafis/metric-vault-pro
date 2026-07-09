import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Metric {
  id: string;
  value: string;
  label: string;
}

const MetricsStrip = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

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
    <section className="py-20">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="metric-tile"
            >
              <div className="text-5xl sm:text-6xl font-display font-bold text-foreground tracking-tight">
                {m.value}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsStrip;
