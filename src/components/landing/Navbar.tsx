import { Link } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import EterniaLogo from "@/components/EterniaLogo";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/60 backdrop-blur-2xl"
    >
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <EterniaLogo size={32} />
          <span className="text-base font-bold font-display text-foreground">Eternia</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Security", href: "#security" },
            { label: "Testimonials", href: "#testimonials" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground/70 hover:text-foreground text-[13px]">
              Sign in
            </Button>
          </Link>
          <Link to="/institution-code">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-[13px] px-5 h-9">
              Get Started
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
        >
          <div className="container mx-auto px-6 py-4 space-y-3">
            {["Features", "How It Works", "Security", "Testimonials"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="block text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
