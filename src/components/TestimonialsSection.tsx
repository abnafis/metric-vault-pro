import { motion } from "framer-motion";
import { Star, Globe, BarChart3, Zap } from "lucide-react";

import jamesImg from "@/assets/testimonials/james-carter.jpg";
import sarahImg from "@/assets/testimonials/sarah-mitchell.jpg";
import davidImg from "@/assets/testimonials/david-chen.jpg";
import emilyImg from "@/assets/testimonials/emily-rodriguez.jpg";
import michaelImg from "@/assets/testimonials/michael-brooks.jpg";
import oliviaImg from "@/assets/testimonials/olivia-tran.jpg";

const trustMetrics = [
  { icon: BarChart3, value: "100+", label: "Tracking Implementations" },
  { icon: Globe, value: "30+", label: "Countries Served" },
  { icon: Zap, value: "15+", label: "Platforms Integrated" },
];

const platformColors: Record<string, string> = {
  Fiverr: "bg-chart-green/15 text-chart-green",
  LinkedIn: "bg-glow-blue/15 text-glow-blue",
  Upwork: "bg-chart-green/15 text-chart-green",
  "Direct Client": "bg-glow-purple/15 text-glow-purple",
};

const testimonials = [
  {
    name: "James Carter",
    role: "Marketing Director, ShopVault",
    img: jamesImg,
    platform: "Fiverr",
    rating: 5,
    text: "Abdullah fixed our broken Google Ads conversion tracking and implemented GA4 properly through GTM. Our reporting is now accurate and our ROAS optimization improved significantly.",
  },
  {
    name: "Sarah Mitchell",
    role: "CEO, GrowthLoop Agency",
    img: sarahImg,
    platform: "LinkedIn",
    rating: 5,
    text: "We had massive data discrepancies between GA4 and our ad platforms. Abdullah implemented server-side tracking with Meta CAPI and our conversion accuracy jumped by over 30%.",
  },
  {
    name: "David Chen",
    role: "E-Commerce Manager, NovaBrand",
    img: davidImg,
    platform: "Upwork",
    rating: 5,
    text: "Professional, fast, and extremely knowledgeable. The GTM setup and enhanced conversions implementation were done flawlessly. Our attribution data finally makes sense.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Growth, SaaSMetrics",
    img: emilyImg,
    platform: "Direct Client",
    rating: 5,
    text: "Abdullah built our entire tracking infrastructure from scratch — GA4, GTM, and CRM integration. We can now track every touchpoint in our trial-to-paid funnel.",
  },
  {
    name: "Michael Brooks",
    role: "PPC Specialist, AdScale Co.",
    img: michaelImg,
    platform: "Fiverr",
    rating: 5,
    text: "After the server-side tracking setup, our Facebook ad campaigns started optimizing correctly again. iOS14 data loss is no longer an issue. Highly recommend.",
  },
  {
    name: "Olivia Tran",
    role: "Founder, LeadHarvest",
    img: oliviaImg,
    platform: "Upwork",
    rating: 5,
    text: "We were sending duplicate form submissions to Google Ads. Abdullah cleaned up our GTM container, added deduplication, and our cost per lead dropped by 35%.",
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "text-chart-orange fill-chart-orange" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 relative">
    <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
    <div className="section-container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm text-glow-cyan uppercase tracking-widest mb-3 font-semibold">Testimonials</p>
        <h2 className="text-3xl sm:text-4xl font-bold">
          Trusted by Teams{" "}
          <span className="gradient-text">Worldwide</span>
        </h2>
      </motion.div>

      {/* Trust metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-16"
      >
        {trustMetrics.map((m) => (
          <div key={m.label} className="text-center">
            <m.icon className="w-5 h-5 text-glow-blue mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Testimonial grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="glass-card-hover p-6 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-glow-blue shrink-0">
                {t.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate">{t.role}</p>
              </div>
            </div>

            {/* Rating + platform */}
            <div className="flex items-center justify-between">
              <StarRating rating={t.rating} />
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${platformColors[t.platform] ?? "bg-secondary text-muted-foreground"}`}>
                {t.platform}
              </span>
            </div>

            {/* Text */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
