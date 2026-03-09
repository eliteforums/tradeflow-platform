import { motion } from "framer-motion";

const institutions = [
  "Demo University",
  "National Institute of Tech",
  "Delhi School of Wellness",
  "IIT Wellbeing Lab",
  "BITS Pilani",
  "IIIT Hyderabad",
  "VIT Vellore",
  "SRM University",
];

const TrustLogos = () => (
  <section className="py-12 px-6 border-t border-border/30">
    <div className="container mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-muted-foreground mb-8"
      >
        Trusted by leading institutions & campus wellness teams
      </motion.p>
      <div className="relative overflow-hidden">
        <div className="flex gap-12 animate-[scroll_20s_linear_infinite]">
          {[...institutions, ...institutions].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-6 py-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustLogos;
