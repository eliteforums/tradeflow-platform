import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustLogos from "@/components/landing/TrustLogos";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CodePreviewSection from "@/components/landing/CodePreviewSection";
import StatsSection from "@/components/landing/StatsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnnouncementBanner />
      <Navbar />
      <HeroSection />
      <TrustLogos />
      <FeaturesSection />
      <HowItWorksSection />
      <CodePreviewSection />
      <StatsSection />
      <SecuritySection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;
