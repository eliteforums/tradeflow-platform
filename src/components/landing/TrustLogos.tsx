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
  "Amity University",
  "Manipal University",
];

const TrustLogos = () => (
  <section className="py-16 px-6">
    <div className="container mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-muted-foreground/60 uppercase tracking-widest mb-10"
      >
        Trusted by 50+ institutions across India
      </motion.p>

      {/* Double row scrolling marquee */}
      <div className="relative overflow-hidden mask-gradient">
        <div className="flex gap-6 animate-[scroll_30s_linear_infinite]">
          {[...institutions, ...institutions, ...institutions].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-6 py-3 rounded-xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <span className="text-sm font-medium text-muted-foreground/70 whitespace-nowrap">
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
