import { Link } from "react-router-dom";
import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Navbar = () => (
  <motion.nav
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
  >
    <div className="container mx-auto px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-eternia flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold font-display text-foreground">Eternia</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          Features <ChevronDown className="w-3 h-3" />
        </a>
        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          How It Works
        </a>
        <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Security
        </a>
        <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Success Stories
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
            Talk to us
          </Button>
        </Link>
        <Link to="/institution-code">
          <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm px-5">
            Try it free
          </Button>
        </Link>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
