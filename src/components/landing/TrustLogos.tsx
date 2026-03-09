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
  <section className="py-8 sm:py-16 px-4 sm:px-6">
    <div className="container mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-[11px] sm:text-sm text-muted-foreground/60 uppercase tracking-widest mb-6 sm:mb-10"
      >
        Trusted by 50+ institutions across India
      </motion.p>

      {/* Scrolling marquee */}
      <div className="relative overflow-hidden mask-gradient">
        <div className="flex gap-3 sm:gap-6 animate-[scroll_30s_linear_infinite]">
          {[...institutions, ...institutions, ...institutions].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <span className="text-[11px] sm:text-sm font-medium text-muted-foreground/70 whitespace-nowrap">
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
