import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import FloatingSocials from "@/components/FloatingSocials";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings.seo_title) document.title = settings.seo_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.seo_description) {
      metaDesc.setAttribute("content", settings.seo_description);
    }
    if (settings.favicon_url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingSocials />
      <HeroSection />
      <CaseStudiesSection />
      <AboutSection />
      <TestimonialsSection />
      <BlogSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
