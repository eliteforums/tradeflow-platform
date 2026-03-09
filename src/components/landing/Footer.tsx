import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="py-10 px-6 border-t border-border/30">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-gradient-eternia flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold font-display text-foreground">Eternia</span>
      </Link>

      <p className="text-xs text-muted-foreground">
        © 2024 Eternia. Institutional Student Wellbeing Platform. All rights reserved.
      </p>

      <div className="flex items-center gap-6">
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</a>
      </div>
    </div>
  </footer>
);

export default Footer;
