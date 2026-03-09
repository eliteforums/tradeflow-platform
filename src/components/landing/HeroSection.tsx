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
      }, 150);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting && displayedText.length === text.length) {
      const pause = setTimeout(() => setIsDeleting(true), 3000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayedText.length > 0) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length - 1));
      }, 100);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText.length === 0) {
      const pause = setTimeout(() => setIsDeleting(false), 800);
      return () => clearTimeout(pause);
    }
  }, [displayedText, text, started, isDeleting]);

  return <>{displayedText}</>;
};

const HeroSection = () => (
  <section className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[280px] sm:h-[500px] rounded-full"
        style={{ background: "radial-gradient(ellipse, hsl(262 52% 60% / 0.25), transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 left-1/3 w-[250px] sm:w-[450px] h-[200px] sm:h-[350px] rounded-full"
        style={{ background: "radial-gradient(ellipse, hsl(166 72% 46% / 0.15), transparent 70%)" }}
      />
    </div>

    <div className="container mx-auto relative z-10">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/60 border border-border/40 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-eternia-success animate-pulse" />
          <span className="text-[11px] sm:text-xs text-muted-foreground">Trusted by 50+ institutions across India</span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-center text-[32px] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight mb-5 sm:mb-6 max-w-4xl mx-auto"
      >
        Student wellbeing,{" "}
        <span className="text-gradient">
          <TypewriterText text="anonymous" delay={600} />
        </span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[0.75em] bg-primary ml-0.5 align-middle"
        />
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center text-[15px] sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-lg sm:max-w-2xl mx-auto leading-relaxed"
      >
        Counselling, peer support, emotional tools & sound therapy — all anonymous, institution-controlled, and DPDP-compliant.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
      >
        <Link to="/institution-code" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base px-8 h-13 gap-2 font-semibold shadow-lg shadow-primary/20 active:scale-[0.97] transition-all">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/login" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-border/50 text-foreground hover:bg-card/80 text-sm sm:text-base px-8 h-13 gap-2 active:scale-[0.97] transition-all">
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </Link>
      </motion.div>

      {/* Trust signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-[12px] sm:text-sm text-muted-foreground mb-12 sm:mb-16"
      >
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>DPDP Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-eternia-warning" />
          <span>4.9/5 Rating</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>5 min setup</span>
        </div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="relative max-w-4xl mx-auto hidden md:block"
      >
        <div className="absolute -inset-6 bg-gradient-to-t from-transparent via-eternia-lavender/5 to-eternia-teal/5 rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/20">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-eternia-warning/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-eternia-success/30" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-0.5 rounded bg-muted/40 text-[11px] text-muted-foreground">
                eternia.app/dashboard
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-12 gap-4 min-h-[300px]">
            <div className="col-span-2 space-y-2">
              <div className="h-7 rounded-lg bg-gradient-eternia opacity-70" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-6 rounded-md ${i === 0 ? 'bg-primary/10 border border-primary/15' : 'bg-muted/20'}`} />
              ))}
            </div>
            <div className="col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-44 rounded bg-foreground/8" />
                  <div className="h-3 w-28 rounded bg-muted-foreground/8" />
                </div>
                <div className="h-7 w-20 rounded-lg bg-gradient-eternia opacity-60" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { color: "from-emerald-500/15 to-teal-500/15", border: "border-emerald-500/15" },
                  { color: "from-pink-500/15 to-rose-500/15", border: "border-pink-500/15" },
                  { color: "from-violet-500/15 to-purple-500/15", border: "border-violet-500/15" },
                ].map((card, i) => (
                  <div key={i} className={`rounded-xl bg-gradient-to-br ${card.color} border ${card.border} p-3 space-y-1.5`}>
                    <div className="w-7 h-7 rounded-lg bg-foreground/4" />
                    <div className="h-2.5 w-16 rounded bg-foreground/8" />
                    <div className="h-2 w-12 rounded bg-muted-foreground/8" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border/20 bg-muted/8 p-3 h-28 flex items-end gap-0.5">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/8"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1 + i * 0.04, duration: 0.4 }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-3 space-y-2.5">
              <div className="rounded-xl border border-border/20 bg-muted/8 p-3 space-y-2">
                <div className="h-3 w-16 rounded bg-foreground/8" />
                <div className="text-2xl font-bold font-display text-gradient">100</div>
                <div className="h-2 w-20 rounded bg-muted-foreground/6" />
              </div>
              <div className="rounded-xl border border-border/20 bg-muted/8 p-3 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/8" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-full rounded bg-foreground/4" />
                      <div className="h-1.5 w-2/3 rounded bg-muted-foreground/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
