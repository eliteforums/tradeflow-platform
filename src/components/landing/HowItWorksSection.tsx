import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Enter Institution Code",
    description: "Your college or university provides a unique Eternia code that validates your institutional access.",
  },
  {
    step: "02",
    title: "Verify with SPOC",
    description: "Scan the QR code from your institution's grievance officer to confirm your enrollment.",
  },
  {
    step: "03",
    title: "Create Your Identity",
    description: "Choose a username and password. No email or phone required — your real identity stays protected.",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 px-6 border-t border-border/30 bg-muted/20">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          Onboarding
        </h2>
        <p className="section-title">
          <span className="text-gradient">Secure</span> Three-Step Onboarding
        </p>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
          Institution-controlled access ensures only verified students can use the platform.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="flex gap-5 items-start rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-eternia flex items-center justify-center shrink-0">
              <span className="text-xl font-bold font-display text-primary-foreground">{item.step}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-display mb-1 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
