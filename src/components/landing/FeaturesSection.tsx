import { Users, Heart, Brain, Music, Sparkles, Calendar, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Calendar,
    title: "Expert Appointments",
    description: "Video & audio sessions with verified mental health professionals.",
    gradient: "from-emerald-500 to-teal-500",
    tag: "Video + Audio",
  },
  {
    icon: Heart,
    title: "Peer Connect",
    description: "Real-time anonymous chat with trained psychology interns.",
    gradient: "from-pink-500 to-rose-500",
    tag: "Real-time",
  },
  {
    icon: Brain,
    title: "BlackBox",
    description: "Anonymous emotional expression. AI monitors for crisis signals quietly.",
    gradient: "from-violet-500 to-purple-500",
    tag: "AI-Monitored",
  },
  {
    icon: Music,
    title: "Sound Therapy",
    description: "Meditation, soundscapes, Tibetan bowls, and guided breathing.",
    gradient: "from-cyan-500 to-blue-500",
    tag: "Audio Library",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-14 sm:py-24 px-4 sm:px-6 relative">
    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-14"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/15 bg-primary/5 mb-3 sm:mb-5">
          <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-wider">Features</span>
        </div>
        <h2 className="section-title mb-3 max-w-2xl mx-auto">
          Everything for <span className="text-gradient">campus wellness</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Five modules. One anonymous identity. Complete institutional control.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            className="group rounded-2xl bg-card/40 border border-border/30 p-4 sm:p-5 hover:bg-card/70 hover:border-primary/15 transition-all duration-300 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground/60">
                {feature.tag}
              </span>
            </div>

            <h3 className="text-sm sm:text-[15px] font-semibold font-display text-foreground mb-1">{feature.title}</h3>
            <p className="text-[12px] sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Self-Help card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-2.5 sm:mt-3 max-w-4xl mx-auto"
      >
        <div className="group rounded-2xl bg-card/40 border border-border/30 p-4 sm:p-5 hover:bg-card/70 hover:border-primary/15 transition-all duration-300">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-[15px] font-semibold font-display text-foreground mb-1">Self-Help & Gamification</h3>
              <p className="text-[12px] sm:text-sm text-muted-foreground mb-2.5 leading-relaxed">
                Quest cards, emotional release tools, and breathing exercises — gamified with XP.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Quest Cards", "Wreck Buddy", "Tibetan Bowl", "XP", "Streaks"].map((tool) => (
                  <span key={tool} className="px-2 py-0.5 rounded-md bg-muted/25 text-[10px] sm:text-[11px] text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;
