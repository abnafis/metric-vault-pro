import { motion, useInView, animate } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Metric { label: string; value: string; }
interface CaseStudy {
  id?: string;
  title: string;
  problem: string;
  solution: string;
  metrics: Metric[];
  chart_data: { v: number }[];
  image_url: string | null;
  client_name: string | null;
  platform_used: string | null;
  industry?: string | null;
  hero_metric_value?: string | null;
  hero_metric_label?: string | null;
  headline?: string | null;
  before_points?: string[];
  after_points?: string[];
  technologies?: string[];
  problem_stat?: string | null;
  solution_stat?: string | null;
  result_stat?: string | null;
  challenge?: string | null;
  audit_findings?: string | null;
  implementation?: string | null;
  architecture?: string | null;
  business_outcome?: string | null;
  cta_label?: string | null;
}

const fallback: CaseStudy[] = [
  {
    title: "Shopify Fashion Brand",
    industry: "Shopify Store",
    hero_metric_value: "+32%",
    hero_metric_label: "Tracking Accuracy",
    headline: "Recovered missing purchase events after implementing server-side tracking.",
    before_points: ["Browser-only tracking", "Low Event Match Quality", "Missing purchases"],
    after_points: ["Server-side GTM", "Meta CAPI", "Enhanced Conversions"],
    technologies: ["GA4", "GTM", "Meta CAPI", "Stape"],
    problem_stat: "40% purchases missing",
    solution_stat: "Server-side GTM + Meta CAPI",
    result_stat: "+32% tracked purchases",
    problem: "Conversion data was 40% under-reported due to iOS14+ tracking loss and misconfigured pixels.",
    solution: "Implemented server-side GTM with Meta CAPI, fixed GA4 e-commerce events, and set up enhanced conversions.",
    metrics: [{ label: "Conversion Accuracy", value: "+32%" }, { label: "ROAS Improvement", value: "+18%" }],
    chart_data: [{ v: 30 }, { v: 25 }, { v: 35 }, { v: 50 }, { v: 48 }, { v: 65 }, { v: 72 }, { v: 80 }],
    image_url: null, client_name: null, platform_used: null,
  },
  {
    title: "B2B SaaS Platform",
    industry: "SaaS",
    hero_metric_value: "100%",
    hero_metric_label: "Attribution Coverage",
    headline: "Mapped every trial-to-paid step into a single attribution model.",
    before_points: ["No funnel events", "Blind ad spend", "CRM disconnected"],
    after_points: ["Full GA4 event map", "CRM sync", "Stage-level reporting"],
    technologies: ["GA4", "GTM", "HubSpot", "BigQuery"],
    problem_stat: "0 funnel visibility",
    solution_stat: "GA4 + CRM event architecture",
    result_stat: "-24% CAC",
    problem: "No tracking for trial-to-paid funnel. Marketing spend was unoptimizable without proper attribution.",
    solution: "Built full GA4 + GTM tracking architecture with custom events for every funnel stage and CRM integration.",
    metrics: [{ label: "Attribution Coverage", value: "100%" }, { label: "CAC Reduction", value: "-24%" }],
    chart_data: [{ v: 15 }, { v: 20 }, { v: 18 }, { v: 30 }, { v: 42 }, { v: 55 }, { v: 60 }, { v: 78 }],
    image_url: null, client_name: null, platform_used: null,
  },
  {
    title: "Lead Gen Agency",
    industry: "Lead Generation",
    hero_metric_value: "-35%",
    hero_metric_label: "Cost Per Lead",
    headline: "Killed duplicate leads so Google Ads optimised on real pipeline.",
    before_points: ["3x duplicate leads", "Junk data in Ads", "No offline import"],
    after_points: ["Clean dataLayer", "Deduplication logic", "Offline conversions"],
    technologies: ["Google Ads", "GTM", "GA4", "Zapier"],
    problem_stat: "3x inflated lead counts",
    solution_stat: "Rebuilt dataLayer + dedup",
    result_stat: "-35% cost per lead",
    problem: "Duplicate form submissions inflated lead counts by 3x. Google Ads was optimising for junk data.",
    solution: "Rebuilt dataLayer, added deduplication logic, and set up offline conversion imports via CRM.",
    metrics: [{ label: "Data Accuracy", value: "+68%" }, { label: "Cost Per Lead", value: "-35%" }],
    chart_data: [{ v: 40 }, { v: 35 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 62 }, { v: 70 }, { v: 85 }],
    image_url: null, client_name: null, platform_used: null,
  },
];

interface MetaData {
  eyebrow: string;
  title: string;
  title_highlight: string;
  title_suffix: string;
  subtitle: string;
}

const fallbackMeta: MetaData = {
  eyebrow: "— Selected work",
  title: "Real results,",
  title_highlight: "proven",
  title_suffix: "impact.",
  subtitle: "A handful of projects where measurement clarity unlocked meaningful growth.",
};

/** Animated number that counts up on first view, preserving prefixes/suffixes like "+32%" */
const CountUpMetric = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/-?\d+(\.\d+)?/);
  const [display, setDisplay] = useState(match ? value.replace(match[0], "0") : value);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseFloat(match[0]);
    const decimals = match[0].includes(".") ? 1 : 0;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(value.replace(match[0], v.toFixed(decimals))),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return <span ref={ref}>{match ? display : value}</span>;
};

const toList = (v: unknown): string[] =>
  Array.isArray(v) ? (v as unknown[]).map((x) => String(x)).filter(Boolean) : [];

const CaseStudiesSection = () => {
  const [cases, setCases] = useState<CaseStudy[]>(fallback);
  const [meta, setMeta] = useState<MetaData>(fallbackMeta);
  const [active, setActive] = useState<CaseStudy | null>(null);

  useEffect(() => {
    supabase
      .from("case_studies")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setCases(data as unknown as CaseStudy[]);
      });
    supabase
      .from("case_studies_meta" as any)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setMeta({ ...fallbackMeta, ...(data as MetaData) });
      });
  }, []);

  return (
    <section id="cases" className="py-32 relative">
      <div className="absolute inset-0 bg-radial-glow-strong opacity-40 pointer-events-none" />
      <div className="section-container relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div className="space-y-4">
            <p className="pill-eyebrow">{meta.eyebrow}</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-2xl">
              {meta.title}{" "}
              <span className="font-serif-display text-primary">{meta.title_highlight}</span>{" "}
              {meta.title_suffix}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm md:text-right">{meta.subtitle}</p>
        </motion.div>

        {/* Card grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cases.map((c, i) => {
            const heroValue = c.hero_metric_value || c.metrics?.[0]?.value || "";
            const heroLabel = c.hero_metric_label || c.metrics?.[0]?.label || "";
            const before = toList(c.before_points);
            const after = toList(c.after_points);
            const techs = toList(c.technologies);
            const chart = (c.chart_data as { v: number }[]) || [];

            return (
              <motion.article
                key={(c.id || c.title) + i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col rounded-3xl border border-white/50 glass p-6 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.35)]"
              >
                {/* Industry badge */}
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {c.industry || c.platform_used || "Case study"}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({String(i + 1).padStart(2, "0")})
                  </span>
                </div>

                {/* Hero metric */}
                <div className="mt-6">
                  <p className="font-serif-display text-6xl leading-none text-primary">
                    <CountUpMetric value={heroValue} />
                  </p>
                  <p className="mt-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                    {heroLabel}
                  </p>
                </div>

                {/* Headline */}
                <h3 className="mt-4 text-lg font-semibold tracking-tight leading-snug text-foreground">
                  {c.headline || c.title}
                </h3>
                {c.headline && c.headline !== c.title && (
                  <p className="mt-1 text-xs text-muted-foreground">{c.title}</p>
                )}

                {/* Mini analytics chart */}
                {chart.length > 0 && (
                  <motion.div
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
                    className="mt-5 h-16 rounded-xl border border-border/70 glass-strong px-2 py-1 shimmer"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chart}>
                        <defs>
                          <linearGradient id={`caseGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
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
                  </motion.div>
                )}

                {/* Before → After */}
                {(before.length > 0 || after.length > 0) && (
                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="rounded-xl border border-border/70 glass p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                        Before
                      </p>
                      <ul className="space-y-1">
                        {before.map((b) => (
                          <li key={b} className="flex gap-1.5 text-[11px] text-muted-foreground leading-snug">
                            <X className="h-3 w-3 shrink-0 mt-[2px] text-destructive/70" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2">
                        After
                      </p>
                      <ul className="space-y-1">
                        {after.map((a) => (
                          <li key={a} className="flex gap-1.5 text-[11px] text-foreground/80 leading-snug">
                            <Check className="h-3 w-3 shrink-0 mt-[2px] text-primary" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {techs.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {techs.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => setActive(c)}
                  className="mt-6 inline-flex items-center justify-between rounded-full border border-border/70 bg-background/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {c.cta_label || "View Case Study"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Expanded detail modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border-border/70 glass-strong">
          {active && (
            <>
              <DialogHeader>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {active.industry || active.platform_used || "Case study"}
                </p>
                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                  {active.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8 pt-2">
                {active.headline && (
                  <p className="text-base text-muted-foreground leading-relaxed">{active.headline}</p>
                )}

                {/* Problem → Solution → Result */}
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { k: "Problem", v: active.problem_stat || active.problem },
                    { k: "Solution", v: active.solution_stat || active.solution },
                    { k: "Result", v: active.result_stat || active.metrics?.[0]?.value },
                  ].map((b, idx) => (
                    <div
                      key={b.k}
                      className={`rounded-2xl border p-4 ${idx === 2 ? "border-primary/30 bg-primary/5" : "border-border/70 glass"}`}
                    >
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                        {b.k}
                      </p>
                      <p className={`text-sm leading-snug ${idx === 2 ? "text-primary font-medium" : "text-foreground/80"}`}>
                        {b.v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                {active.metrics?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(active.metrics as Metric[]).map((m) => (
                      <div key={m.label} className="rounded-2xl border border-border/70 glass p-4">
                        <p className="font-serif-display text-3xl leading-none text-primary">{m.value}</p>
                        <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {active.image_url && (
                  <img
                    src={active.image_url}
                    alt={`${active.title} tracking dashboard`}
                    loading="lazy"
                    className="w-full rounded-2xl border border-border/70 object-cover"
                  />
                )}

                {/* Long-form sections */}
                {[
                  { k: "Client challenge", v: active.challenge || active.problem },
                  { k: "Audit findings", v: active.audit_findings },
                  { k: "Implementation process", v: active.implementation || active.solution },
                  { k: "Tracking architecture", v: active.architecture },
                  { k: "Business outcome", v: active.business_outcome },
                ]
                  .filter((s) => s.v)
                  .map((s) => (
                    <div key={s.k} className="space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {s.k}
                      </p>
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{s.v}</p>
                    </div>
                  ))}

                {/* Before / After */}
                {(toList(active.before_points).length > 0 || toList(active.after_points).length > 0) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/70 glass p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                        Before
                      </p>
                      <ul className="space-y-2">
                        {toList(active.before_points).map((b) => (
                          <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                            <X className="h-4 w-4 shrink-0 mt-[2px] text-destructive/70" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">After</p>
                      <ul className="space-y-2">
                        {toList(active.after_points).map((a) => (
                          <li key={a} className="flex gap-2 text-sm text-foreground/80">
                            <Check className="h-4 w-4 shrink-0 mt-[2px] text-primary" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {toList(active.technologies).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {toList(active.technologies).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href="#contact"
                  onClick={() => setActive(null)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  Get results like this <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CaseStudiesSection;
