import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        if (data && data.length > 0) setCases(data as CaseStudy[]);
      });
  }, []);

  return (
    <section id="cases" className="py-24 relative">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm text-glow-cyan uppercase tracking-widest mb-3 font-semibold">Case Studies</p>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Real Results,{" "}
            <span className="gradient-text">Proven Impact</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.title + i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6 flex flex-col gap-4"
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.title} className="rounded-lg border border-border h-36 w-full object-cover" />
              )}
              <h3 className="font-bold text-lg text-foreground">{c.title}</h3>
              {c.client_name && <p className="text-xs text-muted-foreground">Client: {c.client_name}</p>}
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground"><span className="text-chart-red font-medium">Problem:</span> {c.problem}</p>
                <p className="text-muted-foreground"><span className="text-chart-green font-medium">Solution:</span> {c.solution}</p>
              </div>

              <div className="flex gap-3">
                {(c.metrics as Metric[])?.map((m) => (
                  <div key={m.label} className="metric-card flex-1 text-center">
                    <p className="text-lg font-bold gradient-text-blue">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {c.chart_data && (c.chart_data as { v: number }[]).length > 0 && (
                <div className="mt-auto">
                  <ResponsiveContainer width="100%" height={60}>
                    <AreaChart data={c.chart_data as { v: number }[]}>
                      <defs>
                        <linearGradient id={`caseGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(150 60% 50%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(150 60% 50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="hsl(150 60% 50%)" fill={`url(#caseGrad${i})`} strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
