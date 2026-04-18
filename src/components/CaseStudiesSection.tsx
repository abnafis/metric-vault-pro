import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  metrics: Metric[];
  chart_data: { v: number }[];
  image_url: string | null;
  client_name: string | null;
  platform_used: string | null;
}

const fallback: Omit<CaseStudy, "id">[] = [
  {
    title: "E-Commerce Brand",
    problem: "Conversion data was 40% under-reported due to iOS14+ tracking loss and misconfigured pixels.",
    solution: "Implemented server-side GTM with Meta CAPI, fixed GA4 e-commerce events, and set up enhanced conversions.",
    metrics: [{ label: "Conversion Accuracy", value: "+32%" }, { label: "ROAS Improvement", value: "+18%" }],
    chart_data: [{ v: 30 }, { v: 25 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 65 }, { v: 72 }, { v: 80 }],
    image_url: null, client_name: null, platform_used: null,
  },
  {
    title: "SaaS Platform",
    problem: "No tracking for trial-to-paid funnel. Marketing spend was unoptimizable without proper attribution.",
    solution: "Built full GA4 + GTM tracking architecture with custom events for every funnel stage and CRM integration.",
    metrics: [{ label: "Attribution Coverage", value: "100%" }, { label: "CAC Reduction", value: "-24%" }],
    chart_data: [{ v: 15 }, { v: 20 }, { v: 18 }, { v: 30 }, { v: 42 }, { v: 55 }, { v: 60 }, { v: 78 }],
    image_url: null, client_name: null, platform_used: null,
  },
  {
    title: "Lead Gen Agency",
    problem: "Duplicate form submissions inflated lead counts by 3x. Google Ads was optimising for junk data.",
    solution: "Rebuilt dataLayer, added deduplication logic, and set up offline conversion imports via CRM.",
    metrics: [{ label: "Data Accuracy", value: "+68%" }, { label: "Cost Per Lead", value: "-35%" }],
    chart_data: [{ v: 40 }, { v: 35 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 62 }, { v: 70 }, { v: 85 }],
    image_url: null, client_name: null, platform_used: null,
  },
];

const CaseStudiesSection = () => {
  const [cases, setCases] = useState<Omit<CaseStudy, "id">[]>(fallback);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setCases(data as unknown as CaseStudy[]);
      });
  }, []);

  return (
    <section id="cases" className="py-32 relative">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div className="space-y-4">
            <p className="pill-eyebrow">— Selected work</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-2xl">
              Real results,{" "}
              <span className="font-serif-display text-primary">proven</span> impact.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm md:text-right">
            A handful of projects where measurement clarity unlocked meaningful growth.
          </p>
        </motion.div>

        {/* Case study list */}
        <div className="space-y-px border-t border-b border-border">
          {cases.map((c, i) => (
            <motion.article
              key={c.title + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative grid md:grid-cols-12 gap-6 py-10 border-b border-border last:border-b-0 hover:bg-card/30 transition-colors duration-300 px-2 -mx-2"
            >
              {/* Index */}
              <div className="md:col-span-1 font-mono text-xs text-muted-foreground">
                ({String(i + 1).padStart(2, "0")})
              </div>

              {/* Title + client */}
              <div className="md:col-span-3 space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {c.title}
                </h3>
                {c.client_name && (
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {c.client_name}
                  </p>
                )}
                {c.platform_used && (
                  <p className="text-xs text-muted-foreground">{c.platform_used}</p>
                )}
              </div>

              {/* Problem + solution */}
              <div className="md:col-span-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                    Problem
                  </p>
                  <p className="text-foreground/80 leading-relaxed">{c.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                    Solution
                  </p>
                  <p className="text-foreground/80 leading-relaxed">{c.solution}</p>
                </div>
              </div>

              {/* Metrics + chart */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {(c.metrics as Metric[])?.map((m) => (
                    <div key={m.label} className="border border-border rounded-lg p-3">
                      <p className="font-serif-display text-3xl text-primary leading-none">
                        {m.value}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>

                {c.chart_data && (c.chart_data as { v: number }[]).length > 0 && (
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={c.chart_data as { v: number }[]}>
                        <defs>
                          <linearGradient id={`caseGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke="hsl(var(--primary))"
                          fill={`url(#caseGrad${i})`}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Hover arrow */}
              <ArrowUpRight className="absolute right-4 top-10 w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
