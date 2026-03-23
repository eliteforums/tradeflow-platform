import { motion, AnimatePresence } from "framer-motion";
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

const compliments = [
  { line1: "Stop being so distracting!", line2: "Looking this good should be illegal!", emoji: "🥰" },
  { line1: "Absolutely crushing it!", line2: "Students are thriving here!", emoji: "🔥" },
  { line1: "What a powerhouse!", line2: "Wellness goals, honestly!", emoji: "💪" },
  { line1: "Legend status unlocked!", line2: "Everyone wants to be you!", emoji: "🏆" },
  { line1: "Main character energy!", line2: "Setting the gold standard!", emoji: "✨" },
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

        <div className="relative overflow-x-clip overflow-y-visible mask-gradient pt-24">
          <div className="flex gap-4 sm:gap-6 animate-[scroll_60s_linear_infinite] hover:[animation-play-state:paused]">
            {[...partners, ...partners, ...partners].map((partner, i) => {
              const compliment = compliments[i % compliments.length];
              return (
                <div
                  key={i}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-pointer">
                    <span className="text-sm sm:text-base font-semibold font-display text-foreground/70 hover:text-foreground whitespace-nowrap transition-colors">
                      {partner.name}
                    </span>
                  </div>

                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-30 pointer-events-none"
                      >
                        <div className="relative flex items-center gap-1">
                          {/* Tooltip bubble */}
                          <div className="px-5 py-3 rounded-2xl bg-popover border border-border shadow-2xl max-w-[260px]">
                            <p className="text-sm font-bold text-foreground whitespace-nowrap">
                              {compliment.line1} {compliment.emoji}
                            </p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                              {compliment.line2}
                            </p>
                          </div>
                          {/* Curved arrow pointing right-down toward the card */}
                          <svg
                            width="50"
                            height="50"
                            viewBox="0 0 50 50"
                            fill="none"
                            className="flex-shrink-0 -ml-1"
                          >
                            <path
                              d="M6 8 C 20 8, 34 16, 38 30 C 40 36, 42 40, 46 44"
                              stroke="hsl(var(--foreground))"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              fill="none"
                            />
                            <path
                              d="M42 40 L46 44 L40 44"
                              stroke="hsl(var(--foreground))"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
