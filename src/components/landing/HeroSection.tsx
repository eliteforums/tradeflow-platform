import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (!isDeleting && displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && displayedText.length === text.length) {
      const pause = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayedText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length - 1));
      }, 40);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText.length === 0) {
      const pause = setTimeout(() => setIsDeleting(false), 500);
      return () => clearTimeout(pause);
    }
  }, [displayedText, text, started, isDeleting]);

  return (
    <>
      {displayedText}
      {started && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[0.85em] bg-primary ml-1 align-middle"
        />
      )}
    </>
  );
};

const HeroSection = () => (
  <section className="relative pt-24 pb-8 px-6 overflow-hidden">
    {/* Animated grid background */}
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(ellipse, hsl(270 60% 65% / 0.3), transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 left-1/4 w-[500px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(ellipse, hsl(174 62% 47% / 0.2), transparent 70%)" }}
      />
    </div>

    <div className="container mx-auto relative z-10">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-eternia-success animate-pulse" />
          <span className="text-xs text-muted-foreground">Now serving 50+ institutions across India</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-center text-5xl md:text-7xl lg:text-[80px] font-bold font-display leading-[1.05] tracking-tight mb-6 max-w-5xl mx-auto"
      >
        The Platform That Makes{" "}
        <span className="relative">
          <span className="text-gradient">
            <TypewriterText text="Student Wellbeing" delay={800} />
          </span>
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-eternia rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
          />
        </span>{" "}
        <span className="text-gradient-violet">
          <TypewriterText text="Anonymous" delay={2400} />
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
      >
        Counselling, peer support, emotional tools & sound therapy — all anonymous, 
        institution-controlled, and DPDP-compliant. Deployed in minutes.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
      >
        <Link to="/institution-code">
          <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-13 gap-2 shadow-lg shadow-foreground/10">
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="outline" className="rounded-full border-border/50 text-foreground hover:bg-card text-base px-8 h-13 gap-2">
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </Link>
      </motion.div>

      {/* Social proof mini */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-16"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-primary" />
          <span>DPDP Compliant</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-eternia-warning" />
          <span>4.9/5 Rating</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          <span>5 min setup</span>
        </div>
      </motion.div>

      {/* Dashboard Preview Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="relative max-w-5xl mx-auto"
      >
        {/* Glow behind */}
        <div className="absolute -inset-4 bg-gradient-to-t from-transparent via-eternia-lavender/5 to-eternia-teal/5 rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-background/50">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/40" />
              <div className="w-3 h-3 rounded-full bg-eternia-warning/40" />
              <div className="w-3 h-3 rounded-full bg-eternia-success/40" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                eternia.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard mock */}
          <div className="p-6 grid grid-cols-12 gap-4 min-h-[350px]">
            {/* Sidebar mock */}
            <div className="col-span-2 space-y-3">
              <div className="h-8 rounded-lg bg-gradient-eternia opacity-80" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-7 rounded-md ${i === 0 ? 'bg-primary/15 border border-primary/20' : 'bg-muted/30'}`} />
              ))}
            </div>

            {/* Main content mock */}
            <div className="col-span-7 space-y-4">
              {/* Welcome bar */}
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-5 w-48 rounded bg-foreground/10" />
                  <div className="h-3 w-32 rounded bg-muted-foreground/10" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-gradient-eternia opacity-70" />
              </div>
              
              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20" },
                  { color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/20" },
                  { color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/20" },
                ].map((card, i) => (
                  <div key={i} className={`rounded-xl bg-gradient-to-br ${card.color} border ${card.border} p-4 space-y-2`}>
                    <div className="w-8 h-8 rounded-lg bg-foreground/5" />
                    <div className="h-3 w-20 rounded bg-foreground/10" />
                    <div className="h-2 w-16 rounded bg-muted-foreground/10" />
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 h-32 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/10"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
                  />
                ))}
              </div>
            </div>

            {/* Right panel mock */}
            <div className="col-span-3 space-y-3">
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
                <div className="h-4 w-20 rounded bg-foreground/10" />
                <div className="text-3xl font-bold font-display text-gradient">100</div>
                <div className="h-2 w-24 rounded bg-muted-foreground/10" />
              </div>
              <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 w-full rounded bg-foreground/5" />
                      <div className="h-2 w-2/3 rounded bg-muted-foreground/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fade to background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
