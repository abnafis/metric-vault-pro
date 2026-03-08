import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { BarChart3, Globe, Zap, Settings, Target, TrendingUp, Search, Eye, MousePointerClick, Code, Users, Activity, Shield, Server, Database, Layers, Monitor } from "lucide-react";
import { BlockData } from "./blockTypes";

const iconMap: Record<string, React.ElementType> = {
  BarChart3, Globe, Zap, Settings, Target, TrendingUp, Search, Eye, MousePointerClick, Code, Users, Activity, Shield, Server, Database, Layers, Monitor,
};

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function BlockRenderer({ block }: { block: BlockData }) {
  if (!block.visible) return null;
  const c = block.content as Record<string, any>;

  switch (block.block_type) {
    case "text": {
      const align = c.alignment === "center" ? "text-center" : c.alignment === "right" ? "text-right" : "text-left";
      return (
        <motion.section className={`section-container py-16 ${align}`} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {c.heading && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{c.heading}</h2>}
          {c.subheading && <h3 className="text-xl text-muted-foreground mb-4">{c.subheading}</h3>}
          {c.paragraph && <p className="text-muted-foreground max-w-3xl leading-relaxed">{c.paragraph}</p>}
        </motion.section>
      );
    }

    case "image": {
      const sizeClass = c.size === "small" ? "max-w-sm" : c.size === "medium" ? "max-w-2xl" : "max-w-full";
      const alignClass = c.alignment === "center" ? "mx-auto" : c.alignment === "right" ? "ml-auto" : "";
      return (
        <motion.section className="section-container py-12" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {c.url && (
            <figure className={`${sizeClass} ${alignClass}`}>
              <img src={c.url} alt={c.alt || ""} className="w-full rounded-xl" loading="lazy" />
              {c.caption && <figcaption className="text-sm text-muted-foreground mt-2 text-center">{c.caption}</figcaption>}
            </figure>
          )}
        </motion.section>
      );
    }

    case "cta": {
      const bgClass = c.bg_style === "glass" ? "glass-card" : c.bg_style === "solid" ? "bg-card" : "bg-gradient-to-br from-primary/10 to-accent/10";
      return (
        <motion.section className={`section-container py-20`} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className={`${bgClass} rounded-2xl p-8 md:p-12 text-center`}>
            {c.heading && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{c.heading}</h2>}
            {c.description && <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{c.description}</p>}
            {c.button_text && (
              <a href={c.button_link || "#"} className="btn-primary-glow inline-block px-8 py-3 rounded-lg font-semibold">
                {c.button_text}
              </a>
            )}
          </div>
        </motion.section>
      );
    }

    case "testimonial":
      return (
        <motion.section className="section-container py-12" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="glass-card p-8 max-w-2xl mx-auto text-center">
            {c.avatar_url && <img src={c.avatar_url} alt={c.name || ""} className="w-16 h-16 rounded-full mx-auto mb-4 object-cover" loading="lazy" />}
            {c.text && <p className="text-muted-foreground italic mb-4">"{c.text}"</p>}
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: c.rating || 5 }).map((_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
            </div>
            {c.name && <p className="font-semibold text-foreground">{c.name}</p>}
            {c.role && <p className="text-sm text-muted-foreground">{c.role}</p>}
          </div>
        </motion.section>
      );

    case "service_cards": {
      const cards = (c.cards ?? []) as any[];
      return (
        <motion.section className="section-container py-16" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: any, i: number) => {
              const Icon = iconMap[card.icon] || Settings;
              return (
                <div key={i} className="glass-card glass-card-hover p-6 rounded-xl">
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>
      );
    }

    case "metrics": {
      const items = (c.items ?? []) as any[];
      return (
        <motion.section className="section-container py-16" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item: any, i: number) => {
              const Icon = iconMap[item.icon] || BarChart3;
              return (
                <div key={i} className="metric-card p-6 rounded-xl text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm font-medium text-foreground mt-1">{item.title}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                </div>
              );
            })}
          </div>
        </motion.section>
      );
    }

    case "code": {
      const clean = DOMPurify.sanitize(c.html ?? "", { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"] });
      return (
        <section className="section-container py-12">
          {c.css && <style>{c.css}</style>}
          <div dangerouslySetInnerHTML={{ __html: clean }} />
        </section>
      );
    }

    default:
      return null;
  }
}
