import { motion } from "framer-motion";
import { Settings, Tag, Target, Server, Plug, Bug } from "lucide-react";

const services = [
  {
    icon: Settings,
    title: "GA4 Setup & Configuration",
    desc: "Full Google Analytics 4 implementation with custom events, e-commerce tracking, and audience configuration.",
  },
  {
    icon: Tag,
    title: "GTM Implementation",
    desc: "Professional Tag Manager setup with dataLayer architecture, triggers, variables, and tag governance.",
  },
  {
    icon: Target,
    title: "Conversion Tracking Setup",
    desc: "Pixel-perfect conversion tracking for Google, Meta, TikTok, LinkedIn Ads with accurate attribution.",
  },
  {
    icon: Server,
    title: "Server-Side Tracking",
    desc: "Server-side GTM & Meta CAPI implementation for privacy-compliant, loss-resistant data collection.",
  },
  {
    icon: Plug,
    title: "CRM & Form Tracking",
    desc: "Seamless CRM integration — HubSpot, GoHighLevel, Calendly — with full-funnel tracking.",
  },
  {
    icon: Bug,
    title: "Analytics Debugging",
    desc: "Identify and fix data discrepancies, duplicate events, broken pixels, and attribution gaps.",
  },
];

const ServicesSection = () => (
  <section id="services" className="py-24 relative">
    <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
    <div className="section-container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm text-glow-blue uppercase tracking-widest mb-3 font-semibold">Services</p>
        <h2 className="text-3xl sm:text-4xl font-bold">
          Everything You Need for{" "}
          <span className="gradient-text">Accurate Tracking</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-6 space-y-4 group"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-glow-blue/20 transition-colors">
              <s.icon className="w-5 h-5 text-glow-blue" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
