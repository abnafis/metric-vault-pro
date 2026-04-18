import { motion } from "framer-motion";
import { CheckCircle2, BarChart3, Zap, Globe, Target, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ElementType> = {
  BarChart3, Zap, Globe, Target, TrendingUp, Users, CheckCircle2,
};

interface AboutData {
  section_title: string;
  section_title_highlight: string;
  profile_title: string;
  profile_description: string;
  profile_image_url: string | null;
  certifications: string[];
  stats: { icon: string; value: string; label: string }[];
}

const fallback: AboutData = {
  section_title: "Data-Driven",
  section_title_highlight: "Expertise",
  profile_title: "The Specialist",
  profile_description:
    "With years of hands-on experience in web analytics and conversion tracking, I help businesses fix broken data, implement accurate attribution, and build the measurement infrastructure that modern marketing teams need to scale confidently.",
  profile_image_url: null,
  certifications: ["GA4 & GTM certified expert", "Server-side tracking specialist", "Cross-platform attribution"],
  stats: [
    { icon: "BarChart3", value: "100+", label: "Tracking Setups" },
    { icon: "Globe", value: "15+", label: "Ad Platforms" },
    { icon: "Zap", value: "50+", label: "Businesses Helped" },
  ],
};

const AboutSection = () => {
  const [about, setAbout] = useState<AboutData>(fallback);

  useEffect(() => {
    supabase
      .from("about_content" as any)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setAbout(data as AboutData);
      });
  }, []);

  return (
    <section id="about" className="py-32 relative border-t border-border">
      <div className="section-container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: eyebrow + heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 lg:self-start"
          >
            <p className="pill-eyebrow">— About</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              {about.section_title}{" "}
              <span className="font-serif-display text-primary">
                {about.section_title_highlight.toLowerCase()}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {about.profile_description}
            </p>

            {/* Skills/certifications */}
            <div className="space-y-2 pt-4">
              {about.certifications.map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: stat grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border"
          >
            {about.stats.map((s, i) => {
              const Icon = iconMap[s.icon] || BarChart3;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-background p-8 sm:p-10 group hover:bg-card/40 transition-colors duration-300"
                >
                  <Icon className="w-5 h-5 text-primary mb-6" />
                  <p className="font-serif-display text-6xl text-foreground leading-none mb-2">
                    {s.value}
                  </p>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                </motion.div>
              );
            })}

            {/* Profile title cell — fills grid */}
            <div className="bg-card p-8 sm:p-10 sm:col-span-2 flex items-center gap-6">
              {about.profile_image_url ? (
                <img
                  src={about.profile_image_url}
                  alt={about.profile_title}
                  className="w-16 h-16 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="font-serif-display text-2xl text-primary">A</span>
                </div>
              )}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Specialist
                </p>
                <p className="text-xl font-semibold text-foreground">{about.profile_title}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
