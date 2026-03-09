import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "Pricing", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "DPDP", href: "#" },
  ],
};

const Footer = () => (
  <footer className="border-t border-border/20">
    <div className="container mx-auto px-4 sm:px-5 py-10 sm:py-14">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-eternia flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold font-display text-foreground">Eternia</span>
          </Link>
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-[200px] mb-3">
            Anonymous student wellbeing, built for institutions.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-eternia-success animate-pulse" />
            <span className="text-[10px] text-muted-foreground/40">All systems operational</span>
          </div>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-[10px] font-semibold text-foreground/70 uppercase tracking-widest mb-3">{title}</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[12px] sm:text-[13px] text-muted-foreground/50 hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/30">
          © {new Date().getFullYear()} Eternia
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/30">
          Built with ❤️ for student wellbeing
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
