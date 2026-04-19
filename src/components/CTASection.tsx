import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { trackGenerateLead, buildUserData, trackUserData } from "@/lib/dataLayer";

interface CTAData {
  headline: string;
  headline_highlight: string;
  description: string;
  button_text: string;
  success_title: string;
  success_description: string;
  eyebrow: string;
  bullets: string[];
}

const fallback: CTAData = {
  headline: "Fix your tracking.",
  headline_highlight: "Unlock accurate data.",
  description: "Get a free tracking audit and start making data-driven decisions with confidence.",
  button_text: "Request Free Audit",
  success_title: "Request Received",
  success_description: "I'll review your setup and get back to you within 24 hours.",
  eyebrow: "— Contact",
  bullets: ["Free 30-minute audit call", "Detailed loom walkthrough", "No obligation, no spam"],
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
    if (!/^https?:\/\//i.test(trimmed)) trimmed = "https://" + trimmed;
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
    { key: "name" as const, label: "Name", placeholder: "John Doe", type: "text", maxLength: 100 },
    { key: "email" as const, label: "Email", placeholder: "you@company.com", type: "email", maxLength: 255 },
    { key: "url" as const, label: "Website", placeholder: "yoursite.com", type: "text", maxLength: 500 },
    { key: "platforms" as const, label: "Platforms", placeholder: "GA4, GTM, Meta Ads…", type: "text", maxLength: 500 },
    { key: "ad_spend" as const, label: "Monthly ad spend (optional)", placeholder: "$5,000", type: "text", maxLength: 100 },
    { key: "problem" as const, label: "What's broken?", placeholder: "Describe your tracking issue…", type: "text", maxLength: 2000 },
  ];

  return (
    <section id="cta" className="py-32 relative border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-50 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: pitch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 lg:self-start"
          >
            <p className="pill-eyebrow">— Contact</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              {cta.headline}{" "}
              <span className="font-serif-display text-primary">
                {cta.headline_highlight.toLowerCase()}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {cta.description}
            </p>

            <div className="pt-4 space-y-3">
              {[
                "Free 30-minute audit call",
                "Detailed loom walkthrough",
                "No obligation, no spam",
              ].map((b) => (
                <div key={b} className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-border rounded-2xl p-12 text-center bg-card/30"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">{cta.success_title}</h3>
                <p className="text-muted-foreground">{cta.success_description}</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="border border-border rounded-2xl p-6 sm:p-8 bg-card/30 space-y-5"
                noValidate
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {fields.slice(0, 4).map((f) => (
                    <FieldInput key={f.key} field={f} value={form[f.key]} error={errors[f.key]} onChange={(v) => {
                      setForm({ ...form, [f.key]: v });
                      if (errors[f.key]) setErrors({ ...errors, [f.key]: "" });
                    }} />
                  ))}
                </div>
                <FieldInput
                  field={fields[4]}
                  value={form[fields[4].key]}
                  error={errors[fields[4].key]}
                  onChange={(v) => setForm({ ...form, [fields[4].key]: v })}
                />
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                    {fields[5].label}
                  </label>
                  <textarea
                    placeholder={fields[5].placeholder}
                    maxLength={fields[5].maxLength}
                    rows={4}
                    value={form.problem}
                    onChange={(e) => {
                      setForm({ ...form, problem: e.target.value });
                      if (errors.problem) setErrors({ ...errors, problem: "" });
                    }}
                    className={`w-full rounded-lg bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all resize-none ${
                      errors.problem ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.problem && <p className="text-xs text-destructive mt-1.5">{errors.problem}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-glow w-full !py-4 !text-sm group disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : cta.button_text}
                  <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FieldInput = ({
  field,
  value,
  error,
  onChange,
}: {
  field: { key: string; label: string; placeholder: string; type: string; maxLength: number };
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
      {field.label}
    </label>
    <input
      type={field.type}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg bg-background border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all ${
        error ? "border-destructive" : "border-border"
      }`}
    />
    {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
  </div>
);

export default CTASection;
