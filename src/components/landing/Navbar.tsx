import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EterniaLogo from "@/components/EterniaLogo";
import { useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Testimonials", href: "#testimonials" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/60 backdrop-blur-2xl"
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <EterniaLogo size={28} />
          <span className="text-sm sm:text-base font-bold font-display text-foreground">Eternia</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[13px] text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground/70 hover:text-foreground text-[13px]">
              Sign in
            </Button>
          </Link>
          <Link to="/institution-code">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-[12px] sm:text-[13px] px-4 sm:px-5 h-8 sm:h-9">
              Get Started
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
