import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CTAData {
  headline: string;
  headline_highlight: string;
  description: string;
  button_text: string;
  success_title: string;
  success_description: string;
}

const fallback: CTAData = {
  headline: "Fix Your Tracking.",
  headline_highlight: "Unlock Accurate Marketing Data.",
  description: "Get a free tracking audit and start making data-driven decisions with confidence.",
  button_text: "Request Free Audit",
  success_title: "Request Received!",
  success_description: "I'll review your setup and get back to you within 24 hours.",
};

const CTASection = () => {
  const [cta, setCta] = useState<CTAData>(fallback);
  const [form, setForm] = useState({ name: "", url: "", platforms: "", problem: "", email: "", ad_spend: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("cta_content" as any)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setCta(data as CTAData);
      });
  }, []);

  const normalizeUrl = (url: string): string => {
    let trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed;
    }
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("audit_requests").insert({
        name: form.name,
        email: form.email,
        website_url: normalizeUrl(form.url),
        platforms: form.platforms,
        problem_description: form.problem,
        monthly_ad_spend: form.ad_spend || null,
      } as any);
      if (error) throw error;
      setSubmitted(true);
    } catch {
      // silently fail for visitors, still show success
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="cta" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />
      <div className="section-container relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card glow-border p-8 sm:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {cta.headline}{" "}
              <span className="gradient-text">{cta.headline_highlight}</span>
            </h2>
            <p className="text-muted-foreground">{cta.description}</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--chart-green))]/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-[hsl(var(--chart-green))]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{cta.success_title}</h3>
              <p className="text-muted-foreground text-sm">{cta.success_description}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name" as const, label: "Your Name", placeholder: "John Doe", type: "text" },
                { key: "url" as const, label: "Website URL", placeholder: "yoursite.com", type: "text" },
                { key: "platforms" as const, label: "Platforms Used", placeholder: "GA4, GTM, Meta Ads, Google Ads...", type: "text" },
                { key: "problem" as const, label: "Tracking Problem", placeholder: "Describe your tracking issue...", type: "text" },
                { key: "email" as const, label: "Email", placeholder: "you@company.com", type: "email" },
                { key: "ad_spend" as const, label: "Monthly Ad Spend (Optional)", placeholder: "$5,000", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.key !== "ad_spend"}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  />
                </div>
              ))}
              <button type="submit" disabled={submitting} className="btn-primary-glow w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : cta.button_text}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
