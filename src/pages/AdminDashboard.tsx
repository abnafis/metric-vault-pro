import {
  Wrench, BookOpen, MessageSquareQuote, Monitor, ArrowRight, FileText, ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const quickLinks = [
  { label: "Edit Hero", href: "/admin/hero" },
  { label: "Manage Services", href: "/admin/services" },
  { label: "Edit Testimonials", href: "/admin/testimonials" },
  { label: "CTA Settings", href: "/admin/cta" },
  { label: "Process Steps", href: "/admin/process" },
  { label: "Dashboard Showcase", href: "/admin/dashboard-showcase" },
  { label: "Blog Posts", href: "/admin/blog" },
  { label: "Page Builder", href: "/admin/pages" },
];

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ services: 0, case_studies: 0, testimonials: 0, platforms: 0, blog_posts: 0, audit_requests: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, c, t, p, b, a, posts, audits] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("case_studies").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("platforms").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("audit_requests").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id,title,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("audit_requests").select("id,name,email,status,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      setCounts({
        services: s.count ?? 0,
        case_studies: c.count ?? 0,
        testimonials: t.count ?? 0,
        platforms: p.count ?? 0,
        blog_posts: b.count ?? 0,
        audit_requests: a.count ?? 0,
      });
      if (posts.data) setRecentPosts(posts.data);
      if (audits.data) setRecentAudits(audits.data);
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Services", value: String(counts.services), icon: Wrench, href: "/admin/services", color: "text-primary" },
    { label: "Case Studies", value: String(counts.case_studies), icon: BookOpen, href: "/admin/case-studies", color: "text-accent" },
    { label: "Testimonials", value: String(counts.testimonials), icon: MessageSquareQuote, href: "/admin/testimonials", color: "text-[hsl(var(--glow-cyan))]" },
    { label: "Platforms", value: String(counts.platforms), icon: Monitor, href: "/admin/platforms", color: "text-[hsl(var(--chart-green))]" },
    { label: "Blog Posts", value: String(counts.blog_posts), icon: FileText, href: "/admin/blog", color: "text-primary" },
    { label: "Audit Requests", value: String(counts.audit_requests), icon: ClipboardList, href: "/admin/audit-requests", color: "text-accent" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your website content.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((q) => (
              <Link key={q.label} to={q.href} className="btn-secondary-glass text-center text-sm py-3 hover:border-primary/40 transition-colors">
                {q.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Blog Posts</h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((p) => (
                <Link key={p.id} to="/admin/blog" className="block group">
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.status} · {format(new Date(p.created_at), "MMM d")}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Audit Requests</h2>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAudits.map((a) => (
                <Link key={a.id} to="/admin/audit-requests" className="block group">
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.status} · {format(new Date(a.created_at), "MMM d")}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
