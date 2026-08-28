import { motion } from "framer-motion";
import { Star, Quote, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import jamesImg from "@/assets/testimonials/james-carter.jpg";
import sarahImg from "@/assets/testimonials/sarah-mitchell.jpg";
import davidImg from "@/assets/testimonials/david-chen.jpg";
import emilyImg from "@/assets/testimonials/emily-rodriguez.jpg";
import michaelImg from "@/assets/testimonials/michael-brooks.jpg";
import oliviaImg from "@/assets/testimonials/olivia-tran.jpg";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar_url: string | null;
  rating: number;
  platform: string;
}

const fallback: Testimonial[] = [
  { name: "James Carter", role: "Marketing Director, ShopVault", avatar_url: jamesImg, platform: "Fiverr", rating: 5, text: "Abdullah fixed our broken Google Ads conversion tracking and implemented GA4 properly through GTM. Our reporting is now accurate and our ROAS optimization improved significantly." },
  { name: "Sarah Mitchell", role: "CEO, GrowthLoop Agency", avatar_url: sarahImg, platform: "LinkedIn", rating: 5, text: "We had massive data discrepancies between GA4 and our ad platforms. Server-side tracking with Meta CAPI bumped our conversion accuracy by over 30%." },
  { name: "David Chen", role: "E-Commerce Manager, NovaBrand", avatar_url: davidImg, platform: "Upwork", rating: 5, text: "Professional, fast, and extremely knowledgeable. The GTM setup and enhanced conversions implementation were done flawlessly." },
  { name: "Emily Rodriguez", role: "Head of Growth, SaaSMetrics", avatar_url: emilyImg, platform: "Direct Client", rating: 5, text: "Built our entire tracking infrastructure from scratch. We can now track every touchpoint in our trial-to-paid funnel." },
  { name: "Michael Brooks", role: "PPC Specialist, AdScale Co.", avatar_url: michaelImg, platform: "Fiverr", rating: 5, text: "After the server-side tracking setup, our Facebook campaigns started optimizing correctly again. iOS14 data loss is no longer an issue." },
  { name: "Olivia Tran", role: "Founder, LeadHarvest", avatar_url: oliviaImg, platform: "Upwork", rating: 5, text: "We were sending duplicate form submissions. Cleaned up our GTM container, added deduplication, and our cost per lead dropped by 35%." },
];

interface MetaData {
  eyebrow: string;
  title: string;
  title_highlight: string;
  title_suffix: string;
}

const fallbackMeta: MetaData = {
  eyebrow: "— Voices",
  title: "Trusted by teams",
  title_highlight: "worldwide",
  title_suffix: ".",
};

const MAX_PREVIEW = 180;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallback);
  const [meta, setMeta] = useState<MetaData>(fallbackMeta);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data as Testimonial[]);
      });
    supabase
      .from("testimonials_meta" as any)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setMeta({ ...fallbackMeta, ...(data as MetaData) });
      });
  }, []);

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  return (
    <section id="testimonials" className="py-32 relative border-t border-border/70 overflow-hidden">
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: "hsl(var(--glow-blue-hsl))" }}
      />
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-20 space-y-4"
        >
          <p className="pill-eyebrow">{meta.eyebrow}</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            {meta.title}{" "}
            <span className="font-serif-display text-primary">{meta.title_highlight}</span>{meta.title_suffix}
          </h2>
        </motion.div>

        {/* Masonry-style testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => {
            const key = t.name + i;
            const isLong = t.text.length > MAX_PREVIEW;
            const isExpanded = expanded[key];
            const display = isLong && !isExpanded ? `${t.text.slice(0, MAX_PREVIEW).trim()}…` : t.text;
            return (
              <motion.figure
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="group relative border border-white/50 rounded-2xl p-7 glass hover:glass-strong hover:border-primary/20 transition-all duration-300"
              >
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "hsl(var(--glow-blue-hsl))" }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + (i % 3) * 0.05 }}
                >
                  <Quote className="w-6 h-6 text-primary/40 mb-5" />
                </motion.div>

                <blockquote className="text-foreground/90 leading-relaxed text-[15px] mb-8 relative">
                  {display}
                  {isLong && (
                    <button
                      onClick={() => toggle(key)}
                      className="inline-flex items-center gap-0.5 ml-1 text-xs font-medium text-primary hover:underline"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </blockquote>

                <figcaption className="flex items-center justify-between gap-3 pt-5 border-t border-border/60 relative">
                  <div className="flex items-center gap-3 min-w-0">
                    {t.avatar_url ? (
                      <img
                        src={t.avatar_url}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border border-border/70 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-muted-foreground">
                          {t.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
