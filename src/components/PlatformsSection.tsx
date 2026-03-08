import { motion } from "framer-motion";
import {
  BarChart3, Tag, Megaphone, Share2, Video, Briefcase,
  CalendarCheck, LayoutDashboard, Target, Users
} from "lucide-react";

const platforms = [
  { name: "Google Analytics 4", icon: BarChart3 },
  { name: "Google Tag Manager", icon: Tag },
  { name: "Google Ads", icon: Megaphone },
  { name: "Meta Ads", icon: Share2 },
  { name: "TikTok Ads", icon: Video },
  { name: "LinkedIn Ads", icon: Briefcase },
  { name: "HubSpot", icon: Users },
  { name: "GoHighLevel", icon: Target },
  { name: "Calendly", icon: CalendarCheck },
  { name: "Looker Studio", icon: LayoutDashboard },
];

const PlatformsSection = () => (
  <section className="py-24 relative">
    <div className="section-container">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-10"
      >
        Platforms & Integrations
      </motion.p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {platforms.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover flex flex-col items-center gap-3 py-6 px-4 text-center cursor-default"
          >
            <p.icon className="w-7 h-7 text-glow-blue" />
            <span className="text-xs text-muted-foreground font-medium">{p.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PlatformsSection;
