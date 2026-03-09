import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "DPDP Compliance", href: "#" },
  ],
};

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/20">
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-10">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-3 md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-eternia flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold font-display text-foreground">Eternia</span>
          </Link>
          <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs mb-4 sm:mb-6">
            The anonymous student wellbeing platform built for institutions that care about mental health.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-eternia-success animate-pulse" />
            <span className="text-xs text-muted-foreground/60">All systems operational</span>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3 sm:mb-4">{title}</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-border/20">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Eternia. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground/40">
          Built with ❤️ for student wellbeing
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
