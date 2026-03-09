import { Link } from "react-router-dom";
import { ArrowRight, Shield, MessageCircle, Brain, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FloatingCard = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 + delay, duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const HeroSection = () => (
  <section className="relative pt-20 pb-16 px-6 overflow-hidden min-h-[85vh] flex items-center">
    {/* Background gradients */}
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(270 60% 65% / 0.4), transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(174 62% 47% / 0.3), transparent 70%)" }} />
    </div>

    <div className="container mx-auto relative z-10">
      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
        {/* Left floating cards */}
        <div className="hidden lg:flex flex-col gap-6 items-end">
          <FloatingCard delay={0}>
            <div className="glass-violet rounded-2xl p-4 w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peer Connect</p>
                  <p className="text-sm font-semibold text-foreground">Live Session</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-eternia-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Intern connected • Anonymous</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.3}>
            <div className="glass-violet rounded-2xl p-4 w-[220px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">BlackBox</p>
                  <p className="text-sm font-semibold text-foreground">Safe Space</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">AI-monitored • End-to-end encrypted</p>
            </div>
          </FloatingCard>
        </div>

        {/* Center hero content */}
        <div className="max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-bold font-display leading-[1.1] mb-6"
          >
            Your Complete Platform For
            <span className="text-gradient"> Student Wellbeing</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Eternia provides secure, anonymous tools for counselling, peer support,
            and self-help — built for institutions that care about student mental health.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/institution-code">
              <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-12 gap-2">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted text-base px-8 h-12">
                Book a demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-4"
          >
            Or{" "}
            <Link to="/login" className="text-primary hover:underline">
              sign in to your account
            </Link>
            . 100% anonymous. No personal data required.
          </motion.p>
        </div>

        {/* Right floating cards */}
        <div className="hidden lg:flex flex-col gap-6 items-start">
          <FloatingCard delay={0.15}>
            <div className="glass-violet rounded-2xl p-4 w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sound Therapy</p>
                  <p className="text-sm font-semibold text-foreground">Now Playing</p>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-eternia rounded-full"
                  animate={{ width: ["20%", "80%", "20%"] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.45}>
            <div className="glass-violet rounded-2xl p-4 w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Security</p>
                  <p className="text-sm font-semibold text-foreground">DPDP Act</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">AES-256 • Device-bound</p>
            </div>
          </FloatingCard>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;
