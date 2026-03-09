import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Enter Institution Code",
    description: "Your college or university provides a unique Eternia code that validates your institutional access.",
    detail: "Codes are generated per-institution and controlled by your SPOC officer.",
  },
  {
    step: "02",
    title: "Verify with SPOC",
    description: "Scan the QR code from your institution's grievance officer to confirm your enrollment.",
    detail: "Single Point of Contact ensures only verified students join the platform.",
  },
  {
    step: "03",
    title: "Create Your Identity",
    description: "Choose a username and password. No email or phone required — your real identity stays protected.",
    detail: "100 Eternia Care Credits are automatically added to your account.",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-16 sm:py-28 px-4 sm:px-6 relative">
    <div className="absolute inset-0 bg-muted/10" />

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 sm:mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4 sm:mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Getting Started</span>
        </div>
        <h2 className="section-title">
          <span className="text-gradient">Three steps</span> to anonymous support
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mt-3 sm:mt-4">
          Institution-controlled onboarding ensures privacy from day one.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
            className="relative flex gap-4 sm:gap-6 mb-1 last:mb-0"
          >
            {index < steps.length - 1 && (
              <div className="absolute left-5 sm:left-7 top-[60px] sm:top-[72px] w-px h-[calc(100%-32px)] sm:h-[calc(100%-40px)] bg-gradient-to-b from-primary/20 to-transparent" />
            )}

            <div className="relative z-10 shrink-0">
              <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl bg-gradient-eternia flex items-center justify-center shadow-lg shadow-primary/10">
                <span className="text-sm sm:text-lg font-bold font-display text-primary-foreground">{item.step}</span>
              </div>
            </div>

            <div className="pb-8 sm:pb-10">
              <h3 className="text-base sm:text-lg font-semibold font-display mb-1 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-1">{item.description}</p>
              <p className="text-xs text-muted-foreground/50 italic">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
