import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { trackGenerateLead, trackCTAClick, buildUserData, trackUserData } from "@/lib/dataLayer";

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

const auditSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  url: z.string().trim().min(1, "Website URL is required").max(500),
  platforms: z.string().trim().min(1, "Platforms are required").max(500),
  problem: z.string().trim().min(1, "Please describe your issue").max(2000),
  ad_spend: z.string().max(100).optional(),
});

const CTASection = () => {
  const [cta, setCta] = useState<CTAData>(fallback);
  const [form, setForm] = useState({ name: "", url: "", platforms: "", problem: "", email: "", ad_spend: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setErrors({});

    const result = auditSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("audit_requests").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        website_url: normalizeUrl(form.url),
        platforms: form.platforms.trim(),
        problem_description: form.problem.trim(),
        monthly_ad_spend: form.ad_spend?.trim() || null,
      } as any);
      if (error) throw error;

      // DataLayer: push user_data + generate_lead
      const nameParts = form.name.trim().split(/\s+/);
      const userData = await buildUserData({
        email: form.email,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(" ") || undefined,
      });
      trackUserData(userData);
      trackGenerateLead("free_audit_form", "tracking_audit", userData);

      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: "name" as const, label: "Your Name", placeholder: "John Doe", type: "text", maxLength: 100 },
    { key: "url" as const, label: "Website URL", placeholder: "yoursite.com", type: "text", maxLength: 500 },
    { key: "platforms" as const, label: "Platforms Used", placeholder: "GA4, GTM, Meta Ads, Google Ads...", type: "text", maxLength: 500 },
    { key: "problem" as const, label: "Tracking Problem", placeholder: "Describe your tracking issue...", type: "text", maxLength: 2000 },
    { key: "email" as const, label: "Email", placeholder: "you@company.com", type: "email", maxLength: 255 },
    { key: "ad_spend" as const, label: "Monthly Ad Spend (Optional)", placeholder: "$5,000", type: "text", maxLength: 100 },
  ];

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
              <div className="w-16 h-16 rounded-full bg-chart-green/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-chart-green" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{cta.success_title}</h3>
              <p className="text-muted-foreground text-sm">{cta.success_description}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.key !== "ad_spend"}
                    placeholder={f.placeholder}
                    maxLength={f.maxLength}
                    value={form[f.key]}
                    onChange={(e) => {
                      setForm({ ...form, [f.key]: e.target.value });
                      if (errors[f.key]) setErrors({ ...errors, [f.key]: "" });
                    }}
                    className={`w-full rounded-lg bg-secondary border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
                      errors[f.key] ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors[f.key] && (
                    <p className="text-xs text-destructive mt-1">{errors[f.key]}</p>
                  )}
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
