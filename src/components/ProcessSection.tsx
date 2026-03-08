import { motion } from "framer-motion";
import { Search, Layers, Target, Server, CheckCircle2, BarChart3 } from "lucide-react";

const steps = [
  { icon: Search, title: "Tracking Audit", desc: "Deep-dive into your current tracking setup to identify gaps and issues." },
  { icon: Layers, title: "DataLayer & GTM Setup", desc: "Architect a clean dataLayer and configure GTM containers." },
  { icon: Target, title: "Conversion Tracking", desc: "Implement pixel-accurate conversion events across all ad platforms." },
  { icon: Server, title: "Server-Side Tracking", desc: "Deploy server-side endpoints for Meta CAPI and GTM server container." },
  { icon: CheckCircle2, title: "Verification & Testing", desc: "QA every event, validate data flow, and fix discrepancies." },
  { icon: BarChart3, title: "Dashboard Reporting", desc: "Build real-time dashboards in Looker Studio for ongoing visibility." },
];

const ProcessSection = () => (
  <section id="process" className="py-24 relative overflow-hidden">
    <div className="section-container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm text-glow-purple uppercase tracking-widest mb-3 font-semibold">Process</p>
        <h2 className="text-3xl sm:text-4xl font-bold">
          Implementation{" "}
          <span className="gradient-text">Workflow</span>
        </h2>
      </motion.div>

      <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-6 relative"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-glow-blue/20 text-glow-blue text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <s.icon className="w-5 h-5 text-glow-cyan" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;
