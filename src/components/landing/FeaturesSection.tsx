import { Calendar, Heart, Brain, Music, Sparkles, Award, Drum, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const services = [
  { icon: Calendar, title: "Expert Connect", description: "Book video/audio sessions with verified mental health professionals", gradient: "from-emerald-500 to-teal-500", tag: "Video + Audio" },
  { icon: Heart, title: "Peer Connect", description: "Anonymous real-time chat with trained psychology interns", gradient: "from-pink-500 to-rose-500", tag: "Real-time" },
  { icon: Brain, title: "BlackBox", description: "Express anonymously. AI monitors for crisis signals quietly", gradient: "from-violet-500 to-purple-500", tag: "AI-Monitored" },
  { icon: Award, title: "Quest Cards", description: "Daily wellness quests with XP rewards and streak building", gradient: "from-amber-400 to-orange-500", tag: "Gamified" },
  { icon: Drum, title: "Tibetan Bowl", description: "Interactive 3D sound bowl for meditation and focus", gradient: "from-indigo-400 to-violet-500", tag: "3D Interactive" },
  { icon: Trash2, title: "Wreck Buddy", description: "Emotional release through interactive destruction therapy", gradient: "from-red-400 to-pink-500", tag: "Catharsis" },
  { icon: Music, title: "Sound Therapy", description: "Curated soundscapes, guided breathing, and meditation tracks", gradient: "from-cyan-500 to-blue-500", tag: "Audio Library" },
];

const FeaturesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="py-14 sm:py-24 px-4 sm:px-6 relative">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-3 sm:mb-5">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-wider">Services</span>
          </div>
          <h2 className="section-title mb-3 max-w-2xl mx-auto">
            Your <span className="text-gradient">wellness toolkit</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Seven powerful modules. One anonymous identity. Complete institutional control.
          </p>
        </motion.div>

        {/* Round portal circles */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="relative group flex flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Circle portal */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center cursor-pointer shadow-lg transition-shadow duration-300`}
                style={{
                  boxShadow: hoveredIndex === index
                    ? "0 0 30px 8px hsl(174 62% 47% / 0.2)"
                    : "0 4px 20px -4px rgba(0,0,0,0.3)",
                }}
              >
                <service.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />

                {/* Orbit ring on hover */}
                <motion.div
                  className="absolute inset-[-6px] rounded-full border-2 border-dashed"
                  style={{ borderColor: "hsl(174 62% 47% / 0.3)" }}
                  animate={hoveredIndex === index ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>

              {/* Label */}
              <p className="mt-3 text-xs sm:text-sm font-medium text-foreground text-center max-w-[100px]">
                {service.title}
              </p>

              {/* Hover popup card */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 w-52 p-3.5 rounded-xl bg-card/95 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/20 z-20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-semibold text-foreground">{service.title}</span>
                      <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {service.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{service.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
