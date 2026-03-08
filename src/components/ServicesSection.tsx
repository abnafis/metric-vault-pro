import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings, Tag, Target, Server, Plug, Bug,
  BarChart3, Code, Database, Globe, Shield, Zap,
  Search, Layout, Monitor, Smartphone,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Settings, Tag, Target, Server, Plug, Bug,
  BarChart3, Code, Database, Globe, Shield, Zap,
  Search, Layout, Monitor, Smartphone,
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  sort_order: number;
}

const fallback: Omit<Service, "id" | "sort_order">[] = [
  { title: "GA4 Setup & Configuration", description: "Full Google Analytics 4 implementation with custom events, e-commerce tracking, and audience configuration.", icon: "Settings", features: [] },
  { title: "GTM Implementation", description: "Professional Tag Manager setup with dataLayer architecture, triggers, variables, and tag governance.", icon: "Tag", features: [] },
  { title: "Conversion Tracking Setup", description: "Pixel-perfect conversion tracking for Google, Meta, TikTok, LinkedIn Ads with accurate attribution.", icon: "Target", features: [] },
  { title: "Server-Side Tracking", description: "Server-side GTM & Meta CAPI implementation for privacy-compliant, loss-resistant data collection.", icon: "Server", features: [] },
  { title: "CRM & Form Tracking", description: "Seamless CRM integration — HubSpot, GoHighLevel, Calendly — with full-funnel tracking.", icon: "Plug", features: [] },
  { title: "Analytics Debugging", description: "Identify and fix data discrepancies, duplicate events, broken pixels, and attribution gaps.", icon: "Bug", features: [] },
];

const ServicesSection = () => {
  const [services, setServices] = useState<Omit<Service, "id" | "sort_order">[]>(fallback);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setServices(data as Service[]);
      });
  }, []);

  return (
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
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Settings;
            return (
              <motion.div
                key={s.title + i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6 space-y-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-glow-blue/20 transition-colors">
                  <Icon className="w-5 h-5 text-glow-blue" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                {s.features && s.features.length > 0 && (
                  <ul className="space-y-1">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
