import { motion } from "framer-motion";
import { useState } from "react";

const partners = [
  { name: "Demo University", info: "Pioneer partner — 5,000+ students enrolled" },
  { name: "National Institute of Tech", info: "Flagship engineering campus deployment" },
  { name: "Delhi School of Wellness", info: "Wellness research collaboration" },
  { name: "IIT Wellbeing Lab", info: "Research-backed mental health initiative" },
  { name: "BITS Pilani", info: "Multi-campus deployment across 3 locations" },
  { name: "IIIT Hyderabad", info: "AI-integrated wellness pilot program" },
  { name: "VIT Vellore", info: "Largest student base — 10,000+ users" },
  { name: "SRM University", info: "24/7 anonymous support system" },
  { name: "Amity University", info: "Cross-campus wellness standardization" },
  { name: "Manipal University", info: "Integrated with existing counselling team" },
];

const TrustLogos = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[11px] sm:text-sm text-muted-foreground/60 uppercase tracking-widest mb-8 sm:mb-10"
        >
          Our Partners & Clients
        </motion.p>

        {/* Scrolling belt — 3 second pause per item feel via slow animation */}
        <div className="relative overflow-hidden mask-gradient">
          <div className="flex gap-4 sm:gap-6 animate-[scroll_60s_linear_infinite]">
            {[...partners, ...partners, ...partners].map((partner, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-pointer">
                  <span className="text-sm sm:text-base font-semibold font-display text-foreground/70 group-hover:text-foreground whitespace-nowrap transition-colors">
                    {partner.name}
                  </span>
                </div>

                {/* Hover fade-out info popup */}
                {hoveredIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 p-3 rounded-lg bg-popover/95 backdrop-blur-xl border border-border shadow-xl z-20"
                  >
                    <p className="text-xs font-medium text-foreground mb-0.5">{partner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{partner.info}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
