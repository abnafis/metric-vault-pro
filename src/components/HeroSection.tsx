import { motion } from "framer-motion";
import HeroDashboard from "./HeroDashboard";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
    {/* Background effects */}
    <div className="absolute inset-0 bg-grid-pattern opacity-30" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-glow pointer-events-none" />

    <div className="section-container relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
      {/* Left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 text-xs text-muted-foreground rounded-full">
          <span className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
          Trusted by 100+ businesses
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          Accurate Data.{" "}
          <span className="gradient-text">Better Marketing Decisions.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
          Expert GA4, Google Tag Manager, Server-Side Tracking, Meta CAPI &
          Conversion Tracking implementation — so every click, conversion and
          dollar is measured correctly.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <a href="#cta" className="btn-primary-glow text-sm">
            Get Tracking Audit
          </a>
          <a href="#cases" className="btn-secondary-glass text-sm">
            View Case Studies →
          </a>
        </div>
      </motion.div>

      {/* Right */}
      <div className="flex justify-center lg:justify-end">
        <HeroDashboard />
      </div>
    </div>
  </section>
);

export default HeroSection;
