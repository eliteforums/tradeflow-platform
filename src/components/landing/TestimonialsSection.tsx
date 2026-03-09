import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Eternia transformed how we approach student mental health — the anonymity layer removed the stigma entirely.",
    name: "Dr. Priya Sharma",
    role: "Dean of Student Wellness",
    org: "Demo University",
    highlight: true,
  },
  {
    quote: "The platform's security architecture gave us the confidence to deploy at scale across our 5,000-student campus.",
    name: "Rajesh Kumar",
    role: "CTO",
    org: "National Institute of Technology",
    highlight: false,
  },
  {
    quote: "Students actually use it because they trust it. The anonymous peer connect feature is a game-changer.",
    name: "Anita Desai",
    role: "Head Counsellor",
    org: "Delhi School of Wellness",
    highlight: false,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-28 px-6">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Testimonials</span>
        </div>
        <h2 className="section-title">
          Loved by <span className="text-gradient">campus leaders</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-2xl p-6 transition-all duration-300 ${
              t.highlight
                ? "border border-primary/20 bg-primary/[0.03]"
                : "border border-border/30 bg-card/30"
            } hover:border-primary/30 backdrop-blur-sm`}
          >
            <Quote className="w-8 h-8 text-primary/20 mb-4" />
            <p className="text-sm text-foreground/90 leading-relaxed mb-6">{t.quote}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/20">
              <div className="w-10 h-10 rounded-full bg-gradient-eternia flex items-center justify-center text-xs font-bold text-primary-foreground">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}, {t.org}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
