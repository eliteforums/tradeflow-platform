import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Eternia transformed how we approach student mental health — the anonymity layer removed the stigma entirely.",
    name: "Dr. Priya Sharma",
    role: "Dean of Student Wellness, Demo University",
  },
  {
    quote: "The platform's security architecture gave us the confidence to deploy at scale across our 5,000-student campus.",
    name: "Rajesh Kumar",
    role: "CTO, National Institute of Technology",
  },
  {
    quote: "Students actually use it because they trust it. The anonymous peer connect feature is a game-changer.",
    name: "Anita Desai",
    role: "Head Counsellor, Delhi School of Wellness",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 px-6 border-t border-border/30">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          Success Stories
        </h2>
        <p className="section-title">
          What institutions are{" "}
          <span className="text-gradient">saying</span>
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 transition-all duration-300"
          >
            <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-eternia flex items-center justify-center text-xs font-bold text-primary-foreground">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
