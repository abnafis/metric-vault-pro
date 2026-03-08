import {
  Wrench,
  BookOpen,
  MessageSquareQuote,
  Monitor,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { label: "Services", value: "6", icon: Wrench, href: "/admin/services", color: "text-primary" },
  { label: "Case Studies", value: "3", icon: BookOpen, href: "/admin/case-studies", color: "text-accent" },
  { label: "Testimonials", value: "6", icon: MessageSquareQuote, href: "/admin/testimonials", color: "text-[hsl(var(--glow-cyan))]" },
  { label: "Platforms", value: "6", icon: Monitor, href: "/admin/platforms", color: "text-[hsl(var(--chart-green))]" },
];

const recentEdits = [
  { section: "Hero Section", time: "2 hours ago" },
  { section: "Testimonials", time: "5 hours ago" },
  { section: "Services", time: "1 day ago" },
  { section: "Case Studies", time: "3 days ago" },
];

const quickLinks = [
  { label: "Edit Hero", href: "/admin/hero" },
  { label: "Manage Services", href: "/admin/services" },
  { label: "Edit Testimonials", href: "/admin/testimonials" },
  { label: "CTA Settings", href: "/admin/cta" },
];

const AdminDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your website content.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link to={s.href} className="block glass-card-hover p-5 group">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Edits */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Last Edited</h2>
          </div>
          <div className="space-y-3">
            {recentEdits.map((e) => (
              <div
                key={e.section}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <span className="text-sm text-foreground">{e.section}</span>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((q) => (
              <Link
                key={q.label}
                to={q.href}
                className="btn-secondary-glass text-center text-sm py-3 hover:border-primary/40 transition-colors"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
