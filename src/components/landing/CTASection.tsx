import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => (
  <section className="py-28 px-6 relative overflow-hidden">
    {/* Glow */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[700px] h-[400px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(ellipse, hsl(174 62% 47%), transparent 70%)" }} />
    </div>

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="w-16 h-16 rounded-2xl bg-gradient-eternia flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-bold font-display mb-5 tracking-tight">
          Ready to support your{" "}
          <span className="text-gradient">students?</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Get your institution code, deploy in under 5 minutes, and give every student 
          access to anonymous, professional mental health support.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link to="/institution-code">
            <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-base px-10 h-13 gap-2 shadow-lg shadow-foreground/10">
              Start Free — 100 ECC Included
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="rounded-full border-border/50 text-foreground hover:bg-card text-base px-8 h-13">
              Book a demo
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/60">
          No credit card required • DPDP compliant • Setup in minutes
        </p>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
