import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import HeroSection from "@/components/HeroSection";
import ClientProofRow from "@/components/ClientProofRow";
import LogoMarquee from "@/components/LogoMarquee";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import AboutSection from "@/components/AboutSection";
import FloatingSocials from "@/components/FloatingSocials";
import SEO from "@/components/SEO";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// Below-the-fold sections — deferred so they don't block the initial paint
const WhyNotScalingSection = lazy(() => import("@/components/WhyNotScalingSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const MetricsStrip = lazy(() => import("@/components/MetricsStrip"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const Footer = lazy(() => import("@/components/Footer"));

const SectionFallback = () => <div className="min-h-[300px]" aria-hidden />;

const Index = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.site_name || "Nafis Tracks",
    url: "https://naftracks.lovable.app",
    jobTitle: "Web Analytics Expert",
    sameAs: [] as string[],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={settings.seo_title}
        description={settings.seo_description}
        path="/"
        jsonLd={jsonLd}
      />
      <AnnouncementBar />
      <Navbar />
      <FloatingSocials />
      <HeroSection />
      <ClientProofRow />
      <LogoMarquee />
      <CaseStudiesSection />
      <AboutSection />
      <Suspense fallback={<SectionFallback />}>
        <WhyNotScalingSection />
        <MetricsStrip />
        <TestimonialsSection />
        <ProcessSection />
        <BlogSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
