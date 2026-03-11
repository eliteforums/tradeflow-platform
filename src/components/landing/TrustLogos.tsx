import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const partners = [
  { name: "Demo University", info: "Pioneer partner — 5,000+ students enrolled", compliment: "Stop being so distracting! 🥰\nLooking this good should be illegal!" },
  { name: "National Institute of Tech", info: "Flagship engineering campus deployment", compliment: "Can't stop staring! 😍\nThis campus knows what's up!" },
  { name: "Delhi School of Wellness", info: "Wellness research collaboration", compliment: "Wellness goals! 💚\nSetting the standard for care!" },
  { name: "IIT Wellbeing Lab", info: "Research-backed mental health initiative", compliment: "Brains AND heart? 🧠💜\nThat's the IIT way!" },
  { name: "BITS Pilani", info: "Multi-campus deployment across 3 locations", compliment: "3 campuses, 1 vibe! 🔥\nAbsolutely unstoppable!" },
  { name: "IIIT Hyderabad", info: "AI-integrated wellness pilot program", compliment: "AI meets empathy! 🤖❤️\nThe future looks kind!" },
  { name: "VIT Vellore", info: "Largest student base — 10,000+ users", compliment: "10K strong! 💪\nSize AND substance!" },
  { name: "SRM University", info: "24/7 anonymous support system", compliment: "Always there! 🌙\n24/7 care never looked so good!" },
  { name: "Amity University", info: "Cross-campus wellness standardization", compliment: "Raising the bar! 📈\nConsistency is beautiful!" },
  { name: "Manipal University", info: "Integrated with existing counselling team", compliment: "Teamwork makes the dream! 🤝\nSeamless and stunning!" },
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

        {/* Scrolling belt */}
        <div className="relative overflow-hidden mask-gradient">
          <div className="flex gap-4 sm:gap-6 animate-[scroll_60s_linear_infinite]">
            {[...partners, ...partners, ...partners].map((partner, i) => (
              <div
                key={i}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Card container */}
                <div className="relative px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-card/30 border border-border/20 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden min-w-[180px] sm:min-w-[220px] h-[48px] sm:h-[56px] flex items-center justify-center">
                  
                  {/* Default: Partner name — fades out on hover */}
                  <motion.span
                    className="text-sm sm:text-base font-semibold font-display text-foreground/70 whitespace-nowrap"
                    animate={{ opacity: hoveredIndex === i ? 0 : 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {partner.name}
                  </motion.span>

                  {/* Hover: Fun text + arrow — fades in */}
                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center px-3 gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          {partner.compliment.split("\n").map((line, li) => (
                            <motion.span
                              key={li}
                              className="text-[10px] sm:text-xs font-bold text-foreground whitespace-nowrap"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 + li * 0.1, duration: 0.25 }}
                              style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
                            >
                              {line}
                            </motion.span>
                          ))}
                        </div>

                        {/* Arrow pointing right */}
                        <motion.svg
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                          className="flex-shrink-0 text-foreground"
                          initial={{ opacity: 0, x: -6, rotate: -20 }}
                          animate={{ opacity: 1, x: 0, rotate: 0 }}
                          transition={{ delay: 0.25, duration: 0.3 }}
                        >
                          <path
                            d="M8 4C10 8, 16 12, 22 10M22 10C20 12, 18 18, 20 24M22 10L20 7M22 10L25 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
