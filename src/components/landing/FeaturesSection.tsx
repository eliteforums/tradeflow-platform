import { Users, Heart, Brain, Music, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Calendar,
    title: "Expert Appointments",
    description: "Book sessions with verified mental health professionals through a secure, anonymous interface.",
    gradient: "from-emerald-500 to-teal-500",
    tag: "Counselling",
  },
  {
    icon: Heart,
    title: "Peer Connect",
    description: "Connect with trained psychology interns for real-time anonymous support conversations.",
    gradient: "from-pink-500 to-rose-500",
    tag: "Real-time Chat",
  },
  {
    icon: Brain,
    title: "BlackBox",
    description: "A safe space for anonymous emotional expression with AI-powered crisis detection.",
    gradient: "from-violet-500 to-purple-500",
    tag: "AI-Monitored",
  },
  {
    icon: Music,
    title: "Sound Therapy",
    description: "Access curated audio experiences including meditation, soundscapes, and breathing exercises.",
    gradient: "from-cyan-500 to-blue-500",
    tag: "Audio Library",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6">
    <div className="container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
        <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
          How it Works
        </h2>
        <p className="section-title mb-4">
          Set up in minutes. Support students{" "}
          <span className="text-gradient">anonymously.</span>
        </p>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Five powerful modules designed to support emotional wellbeing while maintaining complete anonymity.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto mt-14">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold font-display text-foreground">{feature.title}</h3>
                  <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                <button className="mt-3 text-sm text-primary font-medium hover:underline">
                  Start building today →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Self-Help Tools - full width card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-5 max-w-5xl mx-auto"
      >
        <div className="rounded-2xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-display text-foreground mb-1">Self-Help Tools</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Daily micro-wellbeing tools including Quest Cards for reflection prompts, Wreck the Buddy for emotional release, and Tibetan Bowl for guided breathing.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Quest Cards", "Wreck the Buddy", "Tibetan Bowl", "XP Rewards"].map((tool) => (
                  <span key={tool} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
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
