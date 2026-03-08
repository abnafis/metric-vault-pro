import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

const CTASection = () => {
  const [form, setForm] = useState({ url: "", platforms: "", problem: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              Fix Your Tracking.{" "}
              <span className="gradient-text">Unlock Accurate Marketing Data.</span>
            </h2>
            <p className="text-muted-foreground">
              Get a free tracking audit and start making data-driven decisions with confidence.
            </p>
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
              <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
              <p className="text-muted-foreground text-sm">I'll review your setup and get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "url" as const, label: "Website URL", placeholder: "https://yoursite.com", type: "url" },
                { key: "platforms" as const, label: "Platforms Used", placeholder: "GA4, GTM, Meta Ads, Google Ads...", type: "text" },
                { key: "problem" as const, label: "Tracking Problem", placeholder: "Describe your tracking issue...", type: "text" },
                { key: "email" as const, label: "Email", placeholder: "you@company.com", type: "email" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-glow-blue/50 transition-all"
                  />
                </div>
              ))}
              <button type="submit" className="btn-primary-glow w-full flex items-center justify-center gap-2 mt-2">
                <Send className="w-4 h-4" />
                Request Free Audit
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
