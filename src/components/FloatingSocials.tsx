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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex flex-row items-center gap-1 px-2 py-2 rounded-full border border-border bg-background/70 backdrop-blur-xl"
    >
      {visible.map((link) => {
        const Icon = getIcon(link.label);
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            className="group relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-200"
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </motion.div>
  );
};

export default FloatingSocials;
