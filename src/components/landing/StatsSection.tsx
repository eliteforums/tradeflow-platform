import { motion } from "framer-motion";
import { Shield, Zap, Clock, Users, Lock, Globe } from "lucide-react";

const stats = [
  { value: "100%", label: "Anonymous", icon: Lock, color: "text-primary" },
  { value: "24/7", label: "Available", icon: Clock, color: "text-eternia-success" },
  { value: "DPDP", label: "Compliant", icon: Shield, color: "text-eternia-lavender" },
  { value: "AES-256", label: "Encrypted", icon: Zap, color: "text-eternia-warning" },
  { value: "5", label: "Modules", icon: Users, color: "text-primary" },
  { value: "99.9%", label: "Uptime", icon: Globe, color: "text-eternia-success" },
];

const StatsSection = () => (
  <section className="py-24 px-6 relative overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, hsl(270 60% 65%), transparent 70%)" }} />
    </div>

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Infrastructure</span>
        </div>
        <h2 className="section-title">
          Built for <span className="text-gradient">scale & security</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="group text-center rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5 hover:bg-card/60 hover:border-primary/20 transition-all duration-300"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-3 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="text-2xl md:text-3xl font-bold font-display text-foreground mb-0.5">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
