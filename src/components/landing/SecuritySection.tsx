import { Shield, CheckCircle, Lock, Fingerprint, Eye, Server, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Lock, label: "AES-256" },
  { icon: Fingerprint, label: "Device Bind" },
  { icon: Eye, label: "Zero-Knowledge" },
  { icon: Server, label: "SOC 2 Ready" },
  { icon: ShieldCheck, label: "DPDP 2023" },
];

const checkItems = [
  "AES-256 encryption for all personal data",
  "Device-level binding for accountability",
  "Institution-controlled data access",
  "Complete anonymity in peer interactions",
  "Formal escalation protocols for emergencies",
  "Separate identity & data storage layers",
];

const SecuritySection = () => (
  <section id="security" className="py-16 sm:py-28 px-4 sm:px-6 relative">
    <div className="absolute inset-0 bg-muted/10" />

    <div className="container mx-auto relative z-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4 sm:mb-6">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Enterprise Security</span>
          </div>
          <h2 className="section-title mb-4 sm:mb-5">
            Privacy-first{" "}
            <span className="text-gradient">by design</span>
          </h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
            Student identity is encrypted, institution-controlled, and accessed 
            only under formal crisis escalation protocols. No exceptions.
          </p>

          <div className="space-y-2.5 sm:space-y-3">
            {checkItems.map((item) => (
              <div key={item} className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, hsl(270 60% 65% / 0.3), transparent 70%)" }} />
          
          <div className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-xl p-6 sm:p-8">
            <Shield className="w-10 sm:w-12 h-10 sm:h-12 text-primary mb-4 sm:mb-5" />
            <h3 className="text-lg sm:text-xl font-bold font-display mb-2 sm:mb-3">Your Data, Your Control</h3>
            <p className="text-sm text-muted-foreground mb-5 sm:mb-6 leading-relaxed">
              Personal information is encrypted and stored separately. Only designated 
              institutional authorities can access identifying data under formal protocols.
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {badges.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-border/20">
                  <badge.icon className="w-4 h-4 text-primary/70" />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default SecuritySection;
