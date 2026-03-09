import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => (
  <section className="py-24 px-6 border-t border-border/30">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="section-title mb-4">
          Get started for{" "}
          <span className="text-gradient">free today</span>
        </h2>
        <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
          Get your institution code and start supporting student wellbeing with 100 free 
          Eternia Care Credits. Need enterprise features? Talk to our team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/institution-code">
            <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-base px-8 h-12 gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted text-base px-8 h-12">
              Book a demo
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
