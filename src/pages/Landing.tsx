import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustLogos from "@/components/landing/TrustLogos";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsSection from "@/components/landing/StatsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import AboutSection from "@/components/landing/AboutSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Snake gradient line running down the page */}
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.12]" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(166 72% 46%)" />
              <stop offset="30%" stopColor="hsl(262 52% 60%)" />
              <stop offset="60%" stopColor="hsl(166 72% 46%)" />
              <stop offset="100%" stopColor="hsl(262 52% 60%)" />
            </linearGradient>
          </defs>
          <path
            d="M 50 0 Q 200 200, 50 400 Q -100 600, 200 800 Q 350 1000, 100 1200 Q -50 1400, 150 1600 Q 300 1800, 80 2000 Q -80 2200, 180 2400 Q 350 2600, 50 2800 Q -100 3000, 200 3200"
            fill="none"
            stroke="url(#snakeGrad)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="relative z-10">
        <AnnouncementBanner />
        <Navbar />
        <main>
          <HeroSection />
          <TrustLogos />
          <section aria-label="Platform features">
            <FeaturesSection />
          </section>
          <section aria-label="How Eternia works">
            <HowItWorksSection />
          </section>
          <section aria-label="Platform statistics">
            <StatsSection />
          </section>
          <section aria-label="Security and privacy">
            <SecuritySection />
          </section>
          <section aria-label="About Eternia">
            <AboutSection />
          </section>
          <section aria-label="Student testimonials">
            <TestimonialsSection />
          </section>
          <section aria-label="Frequently asked questions">
            <FAQSection />
          </section>
          <section aria-label="Get started">
            <CTASection />
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
