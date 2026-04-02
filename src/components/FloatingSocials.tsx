import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Linkedin, Twitter, Github, Youtube, Globe, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  github: Github,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
};

function getIcon(label: string) {
  const key = label.toLowerCase().replace(/[^a-z]/g, "");
  for (const [k, Icon] of Object.entries(iconMap)) {
    if (key.includes(k)) return Icon;
  }
  return Globe;
}

const FloatingSocials = () => {
  const { settings } = useSiteSettings();
  const visible = settings.social_links.filter((l) => l.visible && l.href !== "#");

  if (!visible.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3"
    >
      {visible.map((link, i) => {
        const Icon = getIcon(link.label);
        return (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.1 }}
            className="group relative w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--glow-blue))]/50 hover:shadow-[0_0_12px_hsl(var(--glow-blue)/0.3)] transition-all duration-300"
          >
            <Icon className="w-4 h-4" />
            <span className="absolute left-12 px-2 py-1 rounded bg-card/90 border border-border/50 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {link.label}
            </span>
          </motion.a>
        );
      })}
      <div className="w-px h-8 bg-border/50 mx-auto" />
    </motion.div>
  );
};

export default FloatingSocials;
