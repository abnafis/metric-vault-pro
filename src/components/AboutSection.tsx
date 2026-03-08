import { motion } from "framer-motion";
import { CheckCircle2, BarChart3, Zap, Globe } from "lucide-react";

const stats = [
  { icon: BarChart3, value: "100+", label: "Tracking Setups" },
  { icon: Globe, value: "15+", label: "Ad Platforms Integrated" },
  { icon: Zap, value: "50+", label: "Businesses Helped" },
];

const AboutSection = () => (
  <section id="about" className="py-24 relative">
    <div className="section-container">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Profile area */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="glass-card glow-border p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-glow-blue" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">The Specialist</h3>
            <p className="text-muted-foreground leading-relaxed">
              With years of hands-on experience in web analytics and conversion tracking,
              I help businesses fix broken data, implement accurate attribution, and build
              the measurement infrastructure that modern marketing teams need to scale
              confidently. From GA4 setup to server-side tracking, I've worked across
              every major ad platform and analytics tool.
            </p>
            <div className="space-y-3">
              {["GA4 & GTM certified expert", "Server-side tracking specialist", "Cross-platform attribution"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-chart-green" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div>
            <p className="text-sm text-glow-blue uppercase tracking-widest mb-3 font-semibold">About</p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Data-Driven{" "}
              <span className="gradient-text">Expertise</span>
            </h2>
          </div>

          <div className="grid gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6 flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-lg bg-glow-blue/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-glow-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
