import { motion } from "framer-motion";

const stats = [
  { value: "100%", label: "Anonymous" },
  { value: "24/7", label: "Available" },
  { value: "DPDP", label: "Compliant" },
  { value: "AES-256", label: "Encrypted" },
  { value: "5", label: "Modules" },
  { value: "99.9%", label: "Uptime" },
];

const StatsSection = () => (
  <section className="py-20 px-6 relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[500px] h-[500px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(270 60% 65%), transparent 70%)" }} />
    </div>

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-4"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          Ultra Secure Infrastructure
        </h2>
        <p className="section-title">
          Deploy on <span className="text-gradient">Secure Mesh</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-14 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold font-display text-gradient mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
