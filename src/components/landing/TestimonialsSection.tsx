import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Eternia transformed how we approach student mental health — the anonymity layer removed the stigma entirely.",
    name: "Dr. Priya Sharma",
    role: "Dean, Student Wellness",
    org: "Demo University",
    highlight: true,
  },
  {
    quote: "The security architecture gave us confidence to deploy at scale across our 5,000-student campus.",
    name: "Rajesh Kumar",
    role: "CTO",
    org: "NIT",
    highlight: false,
  },
  {
    quote: "Students actually use it because they trust it. The peer connect feature is a game-changer.",
    name: "Anita Desai",
    role: "Head Counsellor",
    org: "DSW",
    highlight: false,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-14 sm:py-24 px-4 sm:px-6">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-3 sm:mb-5">
          <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-wider">Testimonials</span>
        </div>
        <h2 className="section-title">
          Loved by <span className="text-gradient">campus leaders</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-2xl p-4 sm:p-5 ${
              t.highlight
                ? "border border-primary/15 bg-primary/[0.03]"
                : "border border-border/25 bg-card/30"
            }`}
          >
            <Quote className="w-6 h-6 text-primary/15 mb-3" />
            <p className="text-[13px] sm:text-sm text-foreground/85 leading-relaxed mb-4">{t.quote}</p>
            <div className="flex items-center gap-2.5 pt-3 border-t border-border/15">
              <div className="w-8 h-8 rounded-full bg-gradient-eternia flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-[12px] sm:text-[13px] font-medium text-foreground">{t.name}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t.role}, {t.org}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
