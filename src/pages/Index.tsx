import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PlatformsSection from "@/components/PlatformsSection";
import ServicesSection from "@/components/ServicesSection";
import ProcessSection from "@/components/ProcessSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import DashboardShowcase from "@/components/DashboardShowcase";
import TestimonialsSection from "@/components/TestimonialsSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <PlatformsSection />
    <ServicesSection />
    <ProcessSection />
    <CaseStudiesSection />
    <DashboardShowcase />
    <TestimonialsSection />
    <AboutSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
