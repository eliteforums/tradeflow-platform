import { Shield, CheckCircle, Lock, Fingerprint, Eye, Server } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Lock, label: "AES-256 Encryption" },
  { icon: Fingerprint, label: "Device Binding" },
  { icon: Eye, label: "Zero-Knowledge" },
  { icon: Server, label: "SOC 2 Ready" },
  { icon: Shield, label: "DPDP Act 2023" },
];

const SecuritySection = () => (
  <section id="security" className="py-24 px-6 border-t border-border/30">
    <div className="container mx-auto">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Enterprise & Security
          </h2>
          <p className="section-title mb-6">
            Privacy & Security{" "}
            <span className="text-gradient">By Design</span>
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Eternia is built from the ground up to protect student identity. 
            Personal data is encrypted, institution-controlled, and accessed only 
            under formal crisis escalation protocols.
          </p>

          <div className="space-y-3">
            {[
              "AES-256 encryption for all personal data",
              "Device-level binding for accountability",
              "Institution-controlled data access",
              "Complete anonymity in peer interactions",
              "Formal escalation protocols for emergencies",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
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
          <div className="absolute inset-0 glow-violet rounded-3xl opacity-30" />
          <div className="relative glass-violet rounded-3xl p-8">
            <Shield className="w-14 h-14 text-primary mb-5" />
            <h3 className="text-xl font-bold font-display mb-3">Your Data, Your Control</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Personal information is encrypted and stored separately. Only designated 
              institutional authorities can access identifying data under formal protocols.
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                  <badge.icon className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">{badge.label}</span>
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
